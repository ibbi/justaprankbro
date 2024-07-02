import React from "react";
import { Modal, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { CallHistory } from "../api";
import WrapperWithHeader from "./WrapperWithHeader";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  callHistory: CallHistory[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  callHistory,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="2xl"
      className="dark"
    >
      <WrapperWithHeader title="Call History">
        <ModalBody>
          {callHistory.length > 0 ? (
            callHistory.map((call) => (
              <div key={call.id} className="mb-4 p-4 border rounded">
                <p>Date: {new Date(call.create_time).toLocaleString()}</p>
                <p>To: {call.to_number}</p>
                <p>Script: {call.script_title}</p>
                {call.script_image && (
                  <img
                    src={call.script_image}
                    alt={call.script_title}
                    className="w-16 h-16 object-cover"
                  />
                )}
                {call.link_to_recording && (
                  <audio
                    controls
                    src={call.link_to_recording}
                    className="mt-2"
                  />
                )}
              </div>
            ))
          ) : (
            <p>Make some calls you dingus!!</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose}>Close</Button>
        </ModalFooter>
      </WrapperWithHeader>
    </Modal>
  );
};

export default HistoryModal;
