import React, { FC, ReactElement, useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { useWebSocket } from "../../lib/provider/WebSocketProvider";
import { Flower } from "../../lib/interfaces";
import { FlowerCardProps } from "./FlowerCard";
import InputField from "../common/InputField";
import { updateFlowerAncestry } from "../../lib/service/flower_ancestry";
import { connectFlower } from "../../lib/service/flower";

interface NurseryModalProps {
    key?: string;
    flowerCard: ReactElement<FlowerCardProps>;
    updateFlowers: (flower: Flower) => void;
}

const NurseryModal: FC<NurseryModalProps> = (props: NurseryModalProps) => {
    const websocketContext = useWebSocket();

    const flowerParams: Flower | undefined =
        props.flowerCard.props.flowerParams;

    const [deviceName, setDeviceName] = useState(
        flowerParams ? flowerParams.name : "",
    );
    const [deviceDescription, setDeviceDescription] = useState(
        flowerParams ? flowerParams.description : "",
    );
    const [ipAddress, setIpAddress] = useState(
        flowerParams ? flowerParams.ip : "",
    );
    const [port, setPort] = useState(
        flowerParams ? flowerParams.port.toString() : "81",
    );
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const closeRef: React.MutableRefObject<HTMLButtonElement | null> =
        useRef(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (websocketContext && ipAddress && port) {
            const flower: Flower = {
                id: props.flowerCard.props.id,
                connected: false,
                name: deviceName,
                description: deviceDescription,
                ip: ipAddress,
                port: parseInt(port, 10),
            };
            setIsConnecting(true);
            await connectFlower(
                websocketContext,
                flower,
                (f) => {
                    props.updateFlowers(f);
                    updateFlowerAncestry(f);
                    handleClose();
                },
                (f) => {
                    if (f.connected) {
                        // was previously connected, update flowers
                        f.connected = false;
                        props.updateFlowers(f);
                    }
                },
                () => alert("Failed to connect to device"),
            );
            setIsConnecting(false);
        }
    };

    const handleClose = () => {
        setDeviceName("");
        setDeviceDescription("");
        setIpAddress("");
        setPort("81");
        closeRef?.current?.click && closeRef.current.click();
    };

    return (
        <>
            <Dialog.Root>
                <Dialog.Trigger asChild>{props.flowerCard}</Dialog.Trigger>
                <Dialog.Overlay className="fixed inset-0 bg-const-black bg-opacity-50 z-40" />
                <Dialog.Portal>
                    <Dialog.Content
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pol-bg-1 p-6 rounded-lg w-300 max-w-md z-50"
                        onInteractOutside={(event) => event.preventDefault()}
                    >
                        <Dialog.Title className="text-lg font-bold text-pol-ultra-red">
                            Connect to Flower
                        </Dialog.Title>
                        <Dialog.Close ref={closeRef} className="hidden" />
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 pt-5"
                        >
                            <InputField
                                label="Flower Name"
                                placeholder="Name"
                                value={deviceName}
                                setValue={setDeviceName}
                                type="text"
                            />
                            <InputField
                                label="Flower Description"
                                placeholder="Description"
                                value={deviceDescription}
                                setValue={setDeviceDescription}
                                type="text"
                                required={false}
                            />
                            <InputField
                                label="IP Address"
                                placeholder="Enter IP address"
                                value={ipAddress}
                                setValue={setIpAddress}
                                type="text"
                            />
                            <InputField
                                label="Port"
                                placeholder="Enter port"
                                value={port}
                                setValue={setPort}
                                type="number"
                            />
                            <div className="flex justify-end space-x-3 mt-4">
                                <Dialog.Close asChild>
                                    <button className="text-pol-text-1 px-4 py-2 rounded hover:bg-gray-600">
                                        Cancel
                                    </button>
                                </Dialog.Close>
                                <button
                                    type="submit"
                                    className="bg-pol-ultra-red text-pol-text-2 font-medium px-4 py-2 rounded hover:bg-red-600"
                                >
                                    {isConnecting ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        "Connect"
                                    )}
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
};

export default NurseryModal;
