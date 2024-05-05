import React, { FC } from "react";
import { Tab } from "@headlessui/react"

import ControlGrid from "./pollination_control/ControlGrid";
import MyceliumGrid from "./flower_mycelium/MyceliumGrid";

function classNames(...classes : string[]) {
    return classes.filter(Boolean).join(" ");
}

const Dashboard: FC = () => {
    const categories: { [key: string]: typeof ControlGrid | typeof MyceliumGrid } = {
        "Pollination Control": ControlGrid,
        "Flowers": MyceliumGrid,
    };

    return (
        <div className="w-full max-w-md px-2 py-16 sm:px-0">
            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-transparent p-1">
                    {Object.keys(categories).map((category) => (
                        <Tab
                            key={category}
                            className={({ selected }) =>
                                classNames(
                                    "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                                    selected
                                        ? "bg-pol-bg-1 text-pol-ultra-red font-semibold leading-5"
                                        : "text-pol-text-1"
                                )
                            }
                        >
                        {category}
                        </Tab>
                    ))}
                    </Tab.List>
                    <Tab.Panels className="mt-2">
                        {Object.keys(categories).map((category, i) => (
                            <Tab.Panel
                                key={i}
                                // className={classNames(
                                //     "rounded-xl p-3",
                                //     "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
                                // )}
                            >
                                {React.createElement(categories[category])}
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
        </div>
      )
};

export default Dashboard;