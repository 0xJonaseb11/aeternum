import { BaseError as BaseViemError, ContractFunctionRevertedError } from "viem";

const MAX_ERROR_ARGS_LENGTH = 60;
const MAX_MESSAGE_LENGTH = 200;

function truncateForToast(msg: string): string {
  const trimmed = msg.includes("Contract Call") ? msg.split("Contract Call")[0].trim() : msg;
  if (trimmed.length <= MAX_MESSAGE_LENGTH) return trimmed;
  const firstLine = trimmed.split("\n")[0];
  if (firstLine.length <= MAX_MESSAGE_LENGTH) return firstLine;
  return `${firstLine.slice(0, MAX_MESSAGE_LENGTH - 1)}…`;
}

export const getParsedError = (error: any): string => {
  const parsedError = error?.walk ? error.walk() : error;

  if (parsedError instanceof BaseViemError) {
    if (parsedError.details) {
      return truncateForToast(parsedError.details);
    }

    if (parsedError.shortMessage) {
      if (
        parsedError instanceof ContractFunctionRevertedError &&
        parsedError.data &&
        parsedError.data.errorName !== "Error"
      ) {
        const rawArgs = parsedError.data.args?.toString() ?? "";
        const customErrorArgs =
          rawArgs.length > MAX_ERROR_ARGS_LENGTH ? `${rawArgs.slice(0, MAX_ERROR_ARGS_LENGTH)}…` : rawArgs;
        const reason = customErrorArgs
          ? `${parsedError.data.errorName}(${customErrorArgs})`
          : `${parsedError.data.errorName}()`;
        return `${parsedError.shortMessage.replace(/reverted\.$/, "reverted:")} ${reason}`;
      }

      return truncateForToast(parsedError.shortMessage);
    }

    const fallback = parsedError.message ?? parsedError.name ?? "An unknown error occurred";
    return truncateForToast(fallback);
  }

  const fallback = parsedError?.message ?? "An unknown error occurred";
  return truncateForToast(String(fallback));
};
