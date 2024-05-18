import React, { FC, useState } from "react";
import { Tab } from "@headlessui/react"

import { Flower } from "../interfaces/interfaces";
import ControlGrid from "./pollination_control/ControlGrid";
import MyceliumGrid from "./flower_mycelium/MyceliumGrid";

function classNames(...classes : string[]) {
    return classes.filter(Boolean).join(" ");
}

const Dashboard: FC = () => {
    const [flowers, setFlowers] = useState<Record<string, Flower>>({});

    const categories = [
        { name: "Pollination Control", component: <ControlGrid /> },
        { name: "Flowers", component: <MyceliumGrid flowers={flowers} setFlowers={setFlowers} /> },
    ];

    return (
        <div className="w-full max-w-md px-2 py-16 sm:px-0">
            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-transparent p-1">
                    {categories.map((category) => (
                        <Tab
                            key={category.name}
                            className={({ selected }) =>
                                classNames(
                                    "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                                    selected
                                        ? "bg-pol-bg-1 text-pol-ultra-red font-semibold leading-5"
                                        : "text-pol-text-1"
                                )
                            }
                        >
                        {category.name}
                        </Tab>
                    ))}
                    </Tab.List>
                    <Tab.Panels className="mt-2">
                        {categories.map((category) => (
                            <Tab.Panel key={category.name}>
                                {category.component}
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
        </div>
      )
};

export default Dashboard;