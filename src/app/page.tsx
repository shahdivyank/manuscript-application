"use client";
import dynamic from "next/dynamic";
import { exportToBlob } from "@excalidraw/excalidraw";
import { useState } from "react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
// import CodeMirror from "@uiw/react-codemirror";
// import { gruvboxDark } from "@uiw/codemirror-theme-gruvbox-dark";
// import { cpp } from "@codemirror/lang-cpp";
// import { MdOutlineCancel } from "react-icons/md";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  },
);

export const readFileAsBase64 = (file: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default function Canvas() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const [_, setData] = useState("");
  const [code, setCode] = useState("");
  const [_, setTerminal] = useState("");

  const onConvert = async () => {
    if (!excalidrawAPI) {
      return;
    }

    const elements = excalidrawAPI.getSceneElements();

    if (!elements || !elements.length) {
      return;
    }

    const img = await exportToBlob({
      elements: excalidrawAPI.getSceneElements(),
      mimeType: "image/jpg",
      files: excalidrawAPI.getFiles(),
    });

    const image = await readFileAsBase64(img);

    console.log(image);

    const response = await fetch("/api/ocr", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image,
      }),
    });

    const data = await response.json();

    setData(data);
    setCode(data);
  };

  const onRun = async () => {
    const response = await fetch("/api/execute", {
      method: "POST",
      body: JSON.stringify({ code: code, language: 54 }),
    });

    const result = await response.json();

    console.log(result);
    setTerminal(result.result.stdout);
  };

  return (
    <div className="h-screen w-screen overflow-y-scroll">
      <div className="flex w-full">
        <div className="flex h-[80vh] w-1/2 flex-col items-end gap-3">
          <Excalidraw
            theme="dark"
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
          />
        </div>
        <div className="flex w-1/2 flex-1 flex-col overflow-auto bg-[#292929]">
          {/* <CodeMirror
            extensions={[cpp()]}
            value={code}
            onChange={(value) => setCode(value)}
            theme={gruvboxDark}
          /> */}
        </div>
      </div>
      <div className="flex h-[20vh] w-screen items-center justify-between bg-[#121212]">
        <div className="flex">
          <button
            onClick={onConvert}
            className="mx-5 h-12 w-24 rounded bg-[#403E6A] text-white"
          >
            Convert
          </button>
          <button
            onClick={onRun}
            className="h-12 w-24 rounded bg-[#403E6A] text-white"
          >
            Run
          </button>
        </div>
      </div>
    </div>
  );
}
