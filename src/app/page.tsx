'use client'; // required if using Next.js App Router

import { useRef, useState, useEffect } from 'react';
import SatelliteMap from './test1/page';
import { Button, } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ImageDraw() {
  const [addressInput, setAddressInput] = useState("");
  const [address, setAddress] = useState("");
  
const handleClick = () => {

  setAddress(addressInput)
}
  return (
    <div>

    <div className='flex gap-2'>
      <Label>Insert Zip code or Address: </Label>
      <Input
  type="text"
  value={addressInput}
  onChange={(e) => setAddressInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  }}

  placeholder="Enter address or postal code"
  style={{ padding: '8px', width: '300px' }}
/>
<Button
  onClick={()=>handleClick()}
  >OK</Button>
    </div>
  <SatelliteMap key={address} address={address} />
  </div>
  );
}