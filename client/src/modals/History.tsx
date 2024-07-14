import React from "react";
import { Divider, Image, Modal, ModalBody } from "@nextui-org/react";
import { CallHistory } from "../api";
import WrapperWithHeader from "./WrapperWithHeader";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  callHistory: CallHistory[];
}
const chis = [
  {
    id: 190,
    create_time: "2024-07-05T21:28:27.675761Z",
    to_number: "+17039440786",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA52cc9b67cb2918c28e34bbba10369995.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 188,
    create_time: "2024-07-05T21:22:01.699384Z",
    to_number: "+17039440786",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA79452b09f6a0ca8beb4ced7f807164b2.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 187,
    create_time: "2024-07-05T21:20:43.528994Z",
    to_number: "+17039440786",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA24451e8f543c2a2f0a31e8fe946748e3.mp3",
    script_title: "Bathroom disaster",
    script_image: "https://prankring.com/images/bathroom.png",
  },
  {
    id: 186,
    create_time: "2024-07-05T21:19:44.623755Z",
    to_number: "+17039440786",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAbc306bae5cf317388a8ffe92049d1749.mp3",
    script_title: "Bathroom disaster",
    script_image: "https://prankring.com/images/bathroom.png",
  },
  {
    id: 183,
    create_time: "2024-07-05T03:08:17.667536Z",
    to_number: "+15714715464",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA97271bc10b46bc6dfb0cb496bf6f883e.mp3",
    script_title: "Pp in a lock",
    script_image: "https://prankring.com/images/doorlock.png",
  },
  {
    id: 175,
    create_time: "2024-07-03T22:54:07.846493Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAf9c001cfa6651d0c8943f3675835ce5a.mp3",
    script_title: "Custom script",
    script_image: "https://prankring.com/images/custom_script.png",
  },
  {
    id: 172,
    create_time: "2024-07-03T13:44:45.632334Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA27345698a13c901488cd857a46f92ab7.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 171,
    create_time: "2024-07-03T13:43:54.406101Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAcc418884b5e02a6a22f81c3371ea1cd4.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 170,
    create_time: "2024-07-03T12:41:57.096394Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA4396d30ebbc662f4815cc54335a754f3.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 169,
    create_time: "2024-07-03T12:17:34.494681Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA32215b8a60a260bc6ca573611e58487d.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 168,
    create_time: "2024-07-03T11:48:06.184637Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA0d0523167b19f5301115bc628d3da866.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 167,
    create_time: "2024-07-03T11:39:40.908404Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA6926bdb1db661b6cba7d7350bb8a1aaa.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 166,
    create_time: "2024-07-03T11:38:46.468076Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA443e07ecc66be46a8bb587dedb1e1e56.mp3",
    script_title: "You called my girl",
    script_image: "https://prankring.com/images/call_girl.png",
  },
  {
    id: 165,
    create_time: "2024-07-03T11:34:27.125244Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA1b8721dffcea587d8c2f0152e5f97263.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 164,
    create_time: "2024-07-02T23:10:52.485531Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA710bde5683dd176aeddffe7192dc1fea.mp3",
    script_title: "You called my girl",
    script_image: "https://prankring.com/images/call_girl.png",
  },
  {
    id: 163,
    create_time: "2024-07-01T14:33:28.844272Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA39850f31b6be4b6ae95a4b919cb54cd4.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 162,
    create_time: "2024-07-01T14:32:32.106197Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA8d54230bddcab927bff543be9e9dfc04.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 161,
    create_time: "2024-07-01T14:31:57.147252Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA366ea0b5235d437e55db56c18cafa09f.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 160,
    create_time: "2024-07-01T13:33:19.691484Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA5e0dea9ac47f1c129a84a92e44a51851.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 159,
    create_time: "2024-07-01T13:32:35.681975Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA7294db7b2a7c1b84bf5280cbf624907c.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 158,
    create_time: "2024-07-01T13:26:54.603133Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA1cb67de8646b95c1d88e7836a895d57b.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 157,
    create_time: "2024-07-01T13:26:20.342451Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAdc18925db7ea5cb0d008bd2a36522ddb.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 156,
    create_time: "2024-07-01T13:23:26.272935Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA45e100b4114ce153067fae3b22696b36.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 155,
    create_time: "2024-07-01T13:22:27.973786Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA28a37ec1ce2fb8875e52e415e774c2b9.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 154,
    create_time: "2024-07-01T13:21:56.011966Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA8666eec5d5ce2d4c82fd4b0af7d2e896.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 153,
    create_time: "2024-07-01T13:00:01.651196Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA11666573b2b87d5b17d88263287e12ac.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 152,
    create_time: "2024-07-01T12:59:14.247640Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA23e1d4cf49057077c2cde86ad0b3389e.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 151,
    create_time: "2024-07-01T12:58:10.998559Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAcb38e4666a2ee0c232cf9edd7d970d17.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 148,
    create_time: "2024-07-01T12:11:54.101809Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAf132e15206f15e2cb502e65fec06756b.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 144,
    create_time: "2024-07-01T12:01:33.497402Z",
    to_number: "+13109679790",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA83032bfb070e4c53d6a00c040fc32847.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 143,
    create_time: "2024-07-01T12:00:53.866398Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA0f036457aaa6751552f0b6037108ca25.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 142,
    create_time: "2024-07-01T11:38:08.483221Z",
    to_number: "+13109679790",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA60dbf03deb267f3fa1102694c29da403.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 141,
    create_time: "2024-07-01T01:20:34.215604Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA955573a1a3fa51b1bc7f9538ae04e9ce.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 140,
    create_time: "2024-07-01T01:14:06.099932Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA766321b4cadbe0dac3cea891d61cb0fd.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 137,
    create_time: "2024-07-01T01:11:49.836224Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA26d2ccdff8e2c3cdb6f4c76b4b136b70.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 136,
    create_time: "2024-07-01T01:11:12.985291Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAaaa0925d6618c39c2a130c446e635631.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 135,
    create_time: "2024-07-01T01:01:30.133144Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA401c3a3273f21128f76177fce24f14ef.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 134,
    create_time: "2024-07-01T01:01:06.006359Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA83a6f4a369cf12fc82fe9be4892a7dbd.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 133,
    create_time: "2024-07-01T00:59:42.202240Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAdc5a65c892caa75110912d0c228dbf23.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 132,
    create_time: "2024-07-01T00:42:58.182059Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAd052e970527483978af1f1b2f2bdee76.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 131,
    create_time: "2024-07-01T00:42:21.769154Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAc54e512362c97458f21a6d2d6d62bd7b.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 130,
    create_time: "2024-07-01T00:28:17.142838Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA2b8ef2827936b9c56e8f1939d7db7dfb.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 129,
    create_time: "2024-07-01T00:15:25.432104Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA0ef131a7ecc2d32c388800367555dbcc.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 128,
    create_time: "2024-07-01T00:11:15.103005Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAcee6e270e0c87145a30256e1371dcfad.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 127,
    create_time: "2024-07-01T00:10:05.108052Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA90e891ca70bbe699b9baededc7664019.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 126,
    create_time: "2024-07-01T00:06:50.257387Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA2487eb8490bfe5cc193859e6e96eb137.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 125,
    create_time: "2024-06-30T23:59:47.154616Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAc7b6ee4831d2de0bc1167023e6af7f13.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 124,
    create_time: "2024-06-30T23:57:08.314637Z",
    to_number: "+13109679790",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAb5b3dff6066ea5639ef4adbcb0f8a8e4.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 123,
    create_time: "2024-06-30T23:56:10.490541Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAee31758829863588c9d951532908b2a4.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 122,
    create_time: "2024-06-30T23:40:11.803858Z",
    to_number: "+13109679790",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA7b144f942aefd04167b48b9f363d98ca.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 121,
    create_time: "2024-06-30T23:28:51.916245Z",
    to_number: "+13109679790",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAaa9fc81354cf5e13ecaf5da92b4b6287.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 120,
    create_time: "2024-06-30T23:13:41.345561Z",
    to_number: "+13109679790",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA896e876368c526b5896873e1aa6d6c1d.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 119,
    create_time: "2024-06-30T22:08:52.104450Z",
    to_number: "+13109679790",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA1c4d7caeb4a0a6bcb9abe758916ad341.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 118,
    create_time: "2024-06-30T22:08:37.035524Z",
    to_number: "+13109679790",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA559893fd558db12243cb9b382d1eff85.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 117,
    create_time: "2024-06-30T21:59:10.263575Z",
    to_number: "+13109679790",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAe5bc94f433ada81e958c09e87b60f7df.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 116,
    create_time: "2024-06-30T21:49:38.410862Z",
    to_number: "+13109679790",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA1f28cb96aede7ff8706052412ceaabae.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 115,
    create_time: "2024-06-30T21:38:12.819653Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA2fcc56408079e3fa68ce4dbc02397c32.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 113,
    create_time: "2024-06-30T13:00:33.317812Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAa9e84402b6264d981395c8e9a769f9b9.mp3",
    script_title: "You called my girl",
    script_image: "https://prankring.com/images/call_girl.png",
  },
  {
    id: 112,
    create_time: "2024-06-30T12:58:03.604811Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAbb742165401ae13adfb3bdec477a66be.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 111,
    create_time: "2024-06-29T12:52:10.312350Z",
    to_number: "+13109679790",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CA800358e43e533aa980f6edf21ab288f2.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
  {
    id: 110,
    create_time: "2024-06-29T11:46:51.670918Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAd51ff3825af0c37015091302c908e3df.mp3",
    script_title: "You called my girl",
    script_image: "https://prankring.com/images/call_girl.png",
  },
  {
    id: 109,
    create_time: "2024-06-29T11:43:16.644443Z",
    to_number: "+12402746836",
    link_to_recording:
      "https://prankring.s3.us-east-1.amazonaws.com/recordings/CAa24d826a729f4b0485f3bf00023765ea.mp3",
    script_title: "You hit my car",
    script_image: "https://prankring.com/images/hit_car.png",
  },
];

const isMobile = () => window.innerWidth <= 768;

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  callHistory,
}) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (!callHistory.length) {
    callHistory = chis;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="xl"
      className="dark"
    >
      <WrapperWithHeader title="Call History">
        <ModalBody className="no-scrollbar">
          {callHistory.length > 0 ? (
            callHistory.map((call, idx) => (
              <>
                {idx != 0 && <Divider />}
                <div key={call.id} className="flex flex-row gap-4">
                  <Image
                    width={100}
                    src={call.script_image || undefined}
                    radius="md"
                    hidden={isMobile()}
                  />
                  <div className="flex flex-col gap-4 justify-between grow">
                    {isMobile() && <p>{call.script_title}</p>}
                    <audio
                      controls
                      src={call.link_to_recording || undefined}
                      style={{ width: "100%" }}
                    />
                    <div className="flex flex-row gap-2">
                      <p>{formatDate(call.create_time)}</p>
                      <Divider orientation="vertical" />
                      {!isMobile() && (
                        <>
                          <p>{call.script_title}</p>
                          <Divider orientation="vertical" />
                        </>
                      )}
                      <p>{call.to_number}</p>
                    </div>
                  </div>
                </div>
              </>
            ))
          ) : (
            <p>Make some calls you dingus!!</p>
          )}
        </ModalBody>
      </WrapperWithHeader>
    </Modal>
  );
};

export default HistoryModal;
