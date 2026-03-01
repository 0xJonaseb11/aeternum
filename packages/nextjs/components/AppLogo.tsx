import React from "react";
import Image from "next/image";

type AppLogoProps = {
  className?: string;
  ariaHidden?: boolean;
};

export const AppLogo = ({ className = "h-8 w-8", ariaHidden = true }: AppLogoProps) => (
  <Image src="/logo.svg" alt="Aeternum" className={className} aria-hidden={ariaHidden} width={48} height={48} />
);
