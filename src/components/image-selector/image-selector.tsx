"use client";

import { useState } from "react";
import ImageSelectorMain from "@/components/image-selector/image-selector-main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ImageSelector() {

  const initialZipCode = 'T2P 2M3'
  const [addressInput, setAddressInput] = useState("");
  const [address, setAddress] = useState(initialZipCode);

  const handleClick = () => {
    setAddress(addressInput);
  };

  function validateField(e:React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value);
    setAddressInput(e.target.value)
  }

  return (
    <div>
      <div className="flex gap-2">
        {/* <Label>Insert Zip code</Label> */}
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
          style={{ padding: "8px", width: "300px" }}
        />
        <Button onClick={() => handleClick()}>OK</Button>
      </div>
      <ImageSelectorMain key={address} address={address} />
    </div>
  );
}
