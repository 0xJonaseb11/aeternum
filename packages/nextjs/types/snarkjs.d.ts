declare module "snarkjs" {
  export const groth16: {
    fullProve(
      input: Record<string, string>,
      wasmPath: string,
      zkeyPath: string,
    ): Promise<{
      proof: {
        pi_a: [string, string];
        pi_b: [[string, string], [string, string]];
        pi_c: [string, string];
      };
      publicSignals: string[];
    }>;
  };
}
