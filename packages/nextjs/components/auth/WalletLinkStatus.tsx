"use client";

import { useAccount } from "wagmi";
import { useUserProfile } from "~~/hooks/useUserProfile";

export function WalletLinkStatus() {
  const { address } = useAccount();
  const { profile, loading, error, linkWallet } = useUserProfile();

  if (!address) return null;

  const linked = profile?.primary_wallet_address?.toLowerCase() === address.toLowerCase();

  return (
    <div className="flex flex-col items-end gap-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest font-bold text-base-content/40 hidden lg:inline">
          Wallet link
        </span>
        <button
          className={`btn btn-xs ${
            linked ? "btn-ghost text-success" : "btn-outline text-xs"
          } px-2 h-7 min-h-7 font-bold uppercase tracking-widest`}
          disabled={loading || linked}
          onClick={() => void linkWallet(address)}
        >
          {linked ? "Linked" : "Link to account"}
        </button>
      </div>
      {error && <span className="text-[10px] text-error max-w-xs truncate">{error}</span>}
    </div>
  );
}

