"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { AdjustmentsHorizontalIcon, ShieldCheckIcon, UserCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { AppLogo } from "~~/components/AppLogo";
import { EvidenceList } from "~~/components/vault/EvidenceList";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useVaultScope } from "~~/hooks/vault/useVaultScope";

const ManagePage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { scope, setScope, organizations, loadingOrgs } = useVaultScope();

  return (
    <div className="flex flex-col grow w-full min-w-0">
      <section className="bg-pattern pt-12 pb-10 sm:pt-16 sm:pb-14 border-b border-base-300 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[100vw]">
          <div className="max-w-4xl mx-auto text-center min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4 border border-secondary/20 shadow-sm transition-all hover:bg-secondary/20">
              <AdjustmentsHorizontalIcon className="h-4 w-4 shrink-0" />
              <span>Evidence Management</span>
            </div>
            <div className="flex justify-center mb-3">
              <AppLogo className="h-12 w-12 sm:h-14 sm:w-14 shrink-0" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content mb-2 sm:mb-3 tracking-tight">
              Manage your evidence & access
            </h1>
            <p className="text-sm sm:text-base text-base-content/70 max-w-2xl mx-auto leading-relaxed">
              Grant and revoke access to your evidence proofs, add backups, or permanently revoke proofs from the blockchain.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 bg-base-100 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full min-w-0">
          <div className="flex flex-col gap-6 mb-10">
            {connectedAddress && (
              <div className="flex flex-wrap items-center gap-2 p-1 bg-base-200 rounded-2xl w-fit border border-base-300/50 shadow-inner">
                <button
                  type="button"
                  onClick={() => setScope({ type: "personal" })}
                  className={`btn btn-sm rounded-xl gap-1.5 transition-all ${
                    scope.type === "personal" ? "btn-primary shadow-md" : "btn-ghost text-base-content/60"
                  }`}
                >
                  <UserCircleIcon className="h-4 w-4" />
                  Personal Vault
                </button>
                {!loadingOrgs &&
                  organizations.map(org => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setScope({ type: "org", orgId: org.id, name: org.name })}
                      className={`btn btn-sm rounded-xl gap-1.5 transition-all ${
                        scope.type === "org" && scope.orgId === org.id
                          ? "btn-primary shadow-md"
                          : "btn-ghost text-base-content/60"
                      }`}
                    >
                      <UserGroupIcon className="h-4 w-4" />
                      {org.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {!connectedAddress ? (
            <div className="rounded-3xl border-2 border-dashed border-base-300 bg-base-100 p-12 md:p-20 text-center glass shadow-sm">
              <div className="bg-primary/5 p-4 rounded-full w-fit mx-auto mb-6">
                <ShieldCheckIcon className="h-10 w-10 text-primary/30" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Action Required</h3>
              <p className="text-base-content/60 mb-8 max-w-md mx-auto">
                Please connect your wallet to manage your evidence proofs and access permissions.
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center gap-3">
                <div className="h-1 w-8 bg-primary rounded-full"></div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/40">
                  Select evidence to manage
                </h3>
              </div>
              <EvidenceList scope={scope} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ManagePage;
