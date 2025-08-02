"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import ImageSelectorMain from "@/components/image-selector/image-selector-main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ImageSelector() {

  const initialZipCode = 'T2P 2M3'
  const [addressInput, setAddressInput] = useState("");
  const [address, setAddress] = useState(initialZipCode);

  const handleClick = () => {
    setAddress(addressInput);
  };

  function validateField(e:React.ChangeEvent<HTMLInputElement>) {
    //in case to create rule to validate field
    console.log(e.target.value);
    setAddressInput(e.target.value)
  }

  return (
    <div>
      <div className="flex gap-2 w-full max-w-md">
        <Input
          type="text"
          value={addressInput}
          onChange={(e)=>validateField(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleClick();
            }
          }}
          placeholder="Enter address or postal code"
          className="p-2 w-full bg-white my-2"
        />
        <Button
         className="p-2 bg-green-500 my-2 hover:bg-green-300"
        onClick={() => handleClick()}><MagnifyingGlassIcon/></Button>
      </div>
      <ImageSelectorMain key={address} address={address} />
    </div>
  );
}
