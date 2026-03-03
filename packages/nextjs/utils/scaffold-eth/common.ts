export const replacer = (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const isZeroAddress = (address: string) => address === ZERO_ADDRESS;

const ensRegex = /.+\..+/;
export const isENS = (address = "") => ensRegex.test(address);
