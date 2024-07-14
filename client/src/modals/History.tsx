import React from "react";
import { Divider, Image, Modal, ModalBody } from "@nextui-org/react";
import { CallHistory } from "../api";
import WrapperWithHeader from "./WrapperWithHeader";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  callHistory: CallHistory[];
}

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
