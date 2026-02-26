"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PortalProps = {
    children: React.ReactNode;
};

export const Portal = ({ children }: PortalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted ? createPortal(children, document.body) : null;
};
