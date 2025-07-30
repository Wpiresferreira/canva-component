import { useState } from "react";
import ImageSelector from "../image-selector/image-selector";
import ImageList from "../image-list/image-list";
import ImageUploader from "../image-uploader/image-uploader";

export default function Tabs() {
  const tabsNames = ["Select Area", "Upload Image", "List Images"];
  const [tabSelected, setTabSelected] = useState(tabsNames[0]);

  return (
    <>
      <div className="flex gap-1">
        {tabsNames.map((tabName) => (
          <div
            onClick={() => setTabSelected(tabName)}
            key={tabName}
            className={`rounded-t-md py-2 px-4 selected-none cursor-pointer font-bold text-white ${
              tabName == tabSelected ? "bg-sky-600" : "bg-sky-300"
            }`}
          >
            {tabName}
          </div>
        ))}
      </div>
      <div>{tabSelected == tabsNames[0] && <ImageSelector />}</div>
      <div>{tabSelected == tabsNames[1] && <ImageUploader />}</div>
      <div>{tabSelected == tabsNames[2] && <ImageList />}</div>
    </>
  );
}
