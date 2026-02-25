 aeternum git:(temp) ✗ cd /Users/0xjonaseb11/D
ocuments/PROJECTS/Aetern
um/aeternum/packages/har
dhat
➜  hardhat git:(temp) ✗ 
PATH="$PATH:$HOME/.cargo
/bin" npx ts-node script
s/zkSetup.ts setup 2>&1
═══════════════════════════════════════════════════
  ZK Circuit Trusted Setup
═══════════════════════════════════════════════════

[1/6] Compiling commitment.circom...
template instances: 73
non-linear constraints: 245
linear constraints: 274
public inputs: 2
private inputs: 1
public outputs: 0
wires: 522
labels: 779
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment.r1cs
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment.sym
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_cpp/commitment.cpp and /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_cpp/commitment.dat
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_cpp/main.cpp, circom.hpp, calcwit.hpp, calcwit.cpp, fr.hpp, fr.cpp, fr.asm and Makefile
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_js/commitment.wasm
Everything went okay
      ✓ Circuit compiled

[2/6] Downloading Powers of Tau (pot15)...
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--  0 36.0M    0  1369    0     0   1196      0  8:47:11  0:00:01  8:47:10  0 36.0M    0  306k    0     0   168k      0  0:03:38  0:00:01  0:03:37  2 36.0M    2  901k    0     0   319k      0  0:01:55  0:00:02  0:01:53  3 36.0M    3 1454k    0     0   374k      0  0:01:38  0:00:03  0:01:35  4 36.0M    4 1790k    0     0   371k      0  0:01:39  0:00:04  0:01:35  5 36.0M    5 1918k    0     0   329k      0  0:01:52  0:00:05  0:01:47  5 36.0M    5 2014k    0     0   295k      0  0:02:04  0:00:06  0:01:58  5 36.0M    5 2158k    0     0   276k      0  0:02:13  0:00:07  0:02:06  6 36.0M    6 2366k    0     0   268k      0  0:02:17  0:00:08  0:02:09  6 36.0M    6 2544k    0     0   258k      0  0:02:22  0:00:09  0:02:13  7 36.0M    7 2640k    0     0   244k      0  0:02:31  0:00:10  0:02:21  7 36.0M    7 2825k    0     0   239k      0  0:02:34  0:00:11  0:02:23  8 36.0M    8 3138k    0     0   245k      0  0:02:30  0:00:12  0:02:18 10 36.0M   10 3921k    0     0   284k      0  0:02:10  0:00:13  0:01:57 12 36.0M   12 4686k    0     0   316k      0  0:01:56  0:00:14  0:01:42 13 36.0M   13 4990k    0     0   315k      0  0:01:56  0:00:15  0:01:41 16 36.0M   16 5950k    0     0   353k      0  0:01:44  0:00:16  0:01:28 19 36.0M   19 7214k    0     0   405k      0  0:01:31  0:00:17  0:01:14 20 36.0M   20 7742k    0     0   410k      0  0:01:29  0:00:18  0:01:11 21 36.0M   21 8030k    0     0   405k      0  0:01:31  0:00:19  0:01:12 22 36.0M   22 8430k    0     0   405k      0  0:01:31  0:00:20  0:01:11 24 36.0M   24 9118k    0     0   418k      0  0:01:28  0:00:21  0:01:07 26 36.0M   26 9632k    0     0   421k      0  0:01:27  0:00:22  0:01:05 27 36.0M   27  9.8M    0     0   421k      0  0:01:27  0:00:23  0:01:04 28 36.0M   28 10.3M    0     0   427k      0  0:01:26  0:00:24  0:01:02 30 36.0M   30 10.9M    0     0   434k      0  0:01:25  0:00:25  0:01:00 31 36.0M   31 11.2M    0     0   431k      0  0:01:25  0:00:26  0:00:59 31 36.0M   31 11.4M    0     0   422k      0  0:01:27  0:00:27  0:01:00 32 36.0M   32 11.7M    0     0   416k      0  0:01:28  0:00:28  0:01:00 33 36.0M   33 11.9M    0     0   410k      0  0:01:29  0:00:29  0:01:00 33 36.0M   33 12.1M    0     0   405k      0  0:01:31  0:00:30  0:01:01 34 36.0M   34 12.4M    0     0   400k      0  0:01:32  0:00:31  0:01:01 35 36.0M   35 12.7M    0     0   399k      0  0:01:32  0:00:32  0:01:00 36 36.0M   36 13.0M    0     0   394k      0  0:01:33  0:00:33  0:01:00 36 36.0M   36 13.1M    0     0   387k      0  0:01:35  0:00:34  0:01:01 36 36.0M   36 13.3M    0     0   380k      0  0:01:37  0:00:35  0:01:02 37 36.0M   37 13.5M    0     0   377k      0  0:01:37  0:00:36  0:01:01 38 36.0M   38 13.9M    0     0   378k      0  0:01:37  0:00:37  0:01:00 40 36.0M   40 14.6M    0     0   386k      0  0:01:35  0:00:38  0:00:57 42 36.0M   42 15.2M    0     0   391k      0  0:01:34  0:00:39  0:00:55 43 36.0M   43 15.6M    0     0   392k      0  0:01:34  0:00:40  0:00:54 44 36.0M   44 15.9M    0     0   389k      0  0:01:34  0:00:41  0:00:53 44 36.0M   44 16.0M    0     0   384k      0  0:01:36  0:00:42  0:00:54 46 36.0M   46 16.6M    0     0   388k      0  0:01:35  0:00:43  0:00:52 47 36.0M   47 16.9M    0     0   387k      0  0:01:35  0:00:44  0:00:51 47 36.0M   47 17.1M    0     0   383k      0  0:01:36  0:00:45  0:00:51 47 36.0M   47 17.3M    0     0   378k      0  0:01:37  0:00:46  0:00:51 48 36.0M   48 17.5M    0     0   375k      0  0:01:38  0:00:47  0:00:51 49 36.0M   49 17.6M    0     0   370k      0  0:01:39  0:00:48  0:00:51 49 36.0M   49 17.8M    0     0   366k      0  0:01:40  0:00:49  0:00:51 50 36.0M   50 18.0M    0     0   363k      0  0:01:41  0:00:50  0:00:51 50 36.0M   50 18.1M    0     0   359k      0  0:01:42  0:00:51  0:00:51 50 36.0M   50 18.3M    0     0   355k      0  0:01:43  0:00:52  0:00:51 51 36.0M   51 18.6M    0     0   355k      0  0:01:43  0:00:53  0:00:50 52 36.0M   52 18.9M    0     0   354k      0  0:01:44  0:00:54  0:00:50 53 36.0M   53 19.1M    0     0   350k      0  0:01:45  0:00:55  0:00:50 53 36.0M   53 19.2M    0     0   346k      0  0:01:46  0:00:56  0:00:50 53 36.0M   53 19.4M    0     0   344k      0  0:01:47  0:00:57  0:00:50 54 36.0M   54 19.6M    0     0   342k      0  0:01:47  0:00:58  0:00:49 54 36.0M   54 19.8M    0     0   339k      0  0:01:48  0:00:59  0:00:49 55 36.0M   55 20.1M    0     0   338k      0  0:01:49  0:01:00  0:00:49 56 36.0M   56 20.3M    0     0   336k      0  0:01:49  0:01:01  0:00:48 56 36.0M   56 20.4M    0     0   333k      0  0:01:50  0:01:02  0:00:48 57 36.0M   57 20.6M    0     0   330k      0  0:01:51  0:01:03  0:00:48 57 36.0M   57 20.6M    0     0   326k      0  0:01:53  0:01:04  0:00:49 58 36.0M   58 21.0M    0     0   328k      0  0:01:52  0:01:05  0:00:47 62 36.0M   62 22.4M    0     0   344k      0  0:01:47  0:01:06  0:00:41 65 36.0M   65 23.6M    0     0   356k      0  0:01:43  0:01:07  0:00:36 70 36.0M   70 25.3M    0     0   376k      0  0:01:38  0:01:08  0:00:30 72 36.0M   72 25.9M    0     0   381k      0  0:01:36  0:01:09  0:00:27 73 36.0M   73 26.3M    0     0   380k      0  0:01:37  0:01:10  0:00:27 73 36.0M   73 26.4M    0     0   377k      0  0:01:37  0:01:11  0:00:26 73 36.0M   73 26.6M    0     0   373k      0  0:01:38  0:01:12  0:00:26 74 36.0M   74 26.7M    0     0   370k      0  0:01:39  0:01:13  0:00:26 74 36.0M   74 26.8M    0     0   367k      0  0:01:40  0:01:14  0:00:26 74 36.0M   74 27.0M    0     0   364k      0  0:01:41  0:01:15  0:00:26 75 36.0M   75 27.2M    0     0   363k      0  0:01:41  0:01:16  0:00:25 76 36.0M   76 27.4M    0     0   361k      0  0:01:42  0:01:17  0:00:25 76 36.0M   76 27.5M    0     0   358k      0  0:01:43  0:01:18  0:00:25 76 36.0M   76 27.6M    0     0   355k      0  0:01:44  0:01:19  0:00:25 76 36.0M   76 27.7M    0     0   351k      0  0:01:45  0:01:20  0:00:25 77 36.0M   77 27.9M    0     0   349k      0  0:01:45  0:01:21  0:00:24 77 36.0M   77 28.0M    0     0   347k      0  0:01:46  0:01:22  0:00:24 78 36.0M   78 28.2M    0     0   345k      0  0:01:47  0:01:23  0:00:24 78 36.0M   78 28.4M    0     0   343k      0  0:01:47  0:01:24  0:00:23 79 36.0M   79 28.5M    0     0   340k      0  0:01:48  0:01:25  0:00:23 79 36.0M   79 28.7M    0     0   339k      0  0:01:48  0:01:26  0:00:22 80 36.0M   80 28.9M    0     0   337k      0  0:01:49  0:01:27  0:00:22 80 36.0M   80 29.0M    0     0   335k      0  0:01:50  0:01:28  0:00:22 80 36.0M   80 29.1M    0     0   332k      0  0:01:50  0:01:29  0:00:21 81 36.0M   81 29.3M    0     0   330k      0  0:01:51  0:01:30  0:00:21 81 36.0M   81 29.4M    0     0   327k      0  0:01:52  0:01:31  0:00:21 81 36.0M   81 29.4M    0     0   325k      0  0:01:53  0:01:32  0:00:21 81 36.0M   81 29.5M    0     0   322k      0  0:01:54  0:01:33  0:00:21 82 36.0M   82 29.6M    0     0   320k      0  0:01:55  0:01:34  0:00:21 82 36.0M   82 29.7M    0     0   318k      0  0:01:56  0:01:35  0:00:21 82 36.0M   82 29.9M    0     0   316k      0  0:01:56  0:01:36  0:00:20 83 36.0M   83 30.1M    0     0   315k      0  0:01:56  0:01:37  0:00:19 84 36.0M   84 30.4M    0     0   315k      0  0:01:57  0:01:38  0:00:19 86 36.0M   86 31.1M    0     0   318k      0  0:01:55  0:01:39  0:00:16 88 36.0M   88 31.8M    0     0   323k      0  0:01:54  0:01:40  0:00:14 90 36.0M   90 32.6M    0     0   328k      0  0:01:52  0:01:41  0:00:11 92 36.0M   92 33.2M    0     0   330k      0  0:01:51  0:01:42  0:00:09 92 36.0M   92 33.5M    0     0   330k      0  0:01:51  0:01:43  0:00:08 93 36.0M   93 33.6M    0     0   328k      0  0:01:52  0:01:44  0:00:08 93 36.0M   93 33.8M    0     0   327k      0  0:01:52  0:01:45  0:00:07 94 36.0M   94 34.1M    0     0   325k      0  0:01:53  0:01:47  0:00:06 94 36.0M   94 34.1M    0     0   324k      0  0:01:53  0:01:47  0:00:06 95 36.0M   95 34.3M    0     0   322k      0  0:01:54  0:01:48  0:00:06 95 36.0M   95 34.5M    0     0   322k      0  0:01:54  0:01:49  0:00:05 96 36.0M   96 34.7M    0     0   320k      0  0:01:55  0:01:50  0:00:05 96 36.0M   96 34.9M    0     0   320k      0  0:01:55  0:01:51  0:00:04 97 36.0M   97 35.2M    0     0   320k      0  0:01:55  0:01:52  0:00:03 98 36.0M   98 35.4M    0     0   319k      0  0:01:55  0:01:53  0:00:02 98 36.0M   98 35.6M    0     0   318k      0  0:01:56  0:01:54  0:00:02 99 36.0M   99 36.0M    0     0   318k      0  0:01:56  0:01:55  0:00:01100 36.0M  100 36.0M    0     0   318k      0  0:01:55  0:01:55 --:--:--  270k

[3/6] Running Groth16 circuit-specific setup (phase 2)...
      ✓ Initial zkey created

[4/6] Contributing randomness to zkey...
      ✓ Contribution complete → commitment_final.zkey

[5/6] Exporting verification key...
      ✓ verification_key.json saved

[6/6] Generating Solidity verifier contract...
Error: Package subpath './templates/verifier_groth16.sol' is not defined by "exports" in /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/node_modules/snarkjs/package.json
    at exportsNotFound (node:internal/modules/esm/resolve:322:10)
    at packageExportsResolve (node:internal/modules/esm/resolve:670:9)
    at resolveExports (node:internal/modules/cjs/loader:636:36)
    at Function.Module._findPath (node:internal/modules/cjs/loader:716:31)
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:1198:27)
    at Function.Module._resolveFilename.sharedData.moduleResolveFilenameHook.installedValue [as _resolveFilename] (/Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/node_modules/@cspotcode/source-map-support/source-map-support.js:811:30)
    at Function.Module._load (node:internal/modules/cjs/loader:1043:27)
    at Module.require (node:internal/modules/cjs/loader:1298:19)
    at require (node:internal/modules/helpers:182:18)
    at setup (/Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/scripts/zkSetup.ts:93:32) {
  code: 'ERR_PACKAGE_PATH_NOT_EXPORTED'
}
➜  hardhat git:(temp) ✗ node -e "const s = require('snarkjs'); console.log(Object.keys(s.zKey))"
[
  'newZKey',
  'exportBellman',
  'importBellman',
  'verifyFromR1cs',
  'verifyFromInit',
  'contribute',
  'beacon',
  'exportJson',
  'bellmanContribute',
  'exportVerificationKey',
  'exportSolidityVerifier'
]
➜  hardhat git:(temp) ✗ ls /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/node_modules/snarkjs/templates
/ 2>/dev/null || echo "no templates dir"
verifier_fflonk.sol.ejs  verifier_groth16.sol.ejs verifier_plonk.sol.ejs
➜  hardhat git:(temp) ✗ PATH="$PATH:$HOME/.cargo/bin" npx ts-node scripts/zkSetup.ts setup 2>&1
═══════════════════════════════════════════════════
  ZK Circuit Trusted Setup
═══════════════════════════════════════════════════

[1/6] Compiling commitment.circom...
template instances: 73
non-linear constraints: 245
linear constraints: 274
public inputs: 2
private inputs: 1
public outputs: 0
wires: 522
labels: 779
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment.r1cs
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment.sym
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_cpp/commitment.cpp and /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_cpp/commitment.dat
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_cpp/main.cpp, circom.hpp, calcwit.hpp, calcwit.cpp, fr.hpp, fr.cpp, fr.asm and Makefile
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_js/commitment.wasm
Everything went okay
      ✓ Circuit compiled

[2/6] Powers of Tau already present, skipping download.

[3/6] Running Groth16 circuit-specific setup (phase 2)...
      ✓ Initial zkey created

[4/6] Contributing randomness to zkey...
      ✓ Contribution complete → commitment_final.zkey

[5/6] Exporting verification key...
      ✓ verification_key.json saved

[6/6] Generating Solidity verifier contract...
TypeError: Cannot read properties of undefined (reading 'groth16')
    at Object.exportSolidityVerifier (/Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/node_modules/snarkjs/build/main.cjs:6356:29)
    at async setup (/Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/scripts/zkSetup.ts:94:24)
    at async /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/scripts/zkSetup.ts:197:24
➜  hardhat git:(temp) ✗ PATH="$PATH:$HOME/.cargo/bin" npx ts-node scripts/zkSetup.ts setup 2>&1
═══════════════════════════════════════════════════
  ZK Circuit Trusted Setup
═══════════════════════════════════════════════════

[1/6] Compiling commitment.circom...
template instances: 73
non-linear constraints: 245
linear constraints: 274
public inputs: 2
private inputs: 1
public outputs: 0
wires: 522
labels: 779
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment.r1cs
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment.sym
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_cpp/commitment.cpp and /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_cpp/commitment.dat
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_cpp/main.cpp, circom.hpp, calcwit.hpp, calcwit.cpp, fr.hpp, fr.cpp, fr.asm and Makefile
Written successfully: /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_js/commitment.wasm
Everything went okay
      ✓ Circuit compiled

[2/6] Powers of Tau already present, skipping download.

[3/6] Running Groth16 circuit-specific setup (phase 2)...
      ✓ Initial zkey created

[4/6] Contributing randomness to zkey...
      ✓ Contribution complete → commitment_final.zkey

[5/6] Exporting verification key...
      ✓ verification_key.json saved

[6/6] Generating Solidity verifier contract...
      ✓ CommitmentVerifier.sol written to /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/contracts/CommitmentVerifier.sol

═══════════════════════════════════════════════════
  Setup Complete. Artifacts:
    WASM:   /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_js/commitment.wasm
    ZKey:   /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/commitment_final.zkey
    VKey:   /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/build/circuits/verification_key.json
    Sol:    /Users/0xjonaseb11/Documents/PROJECTS/Aeternum/aeternum/packages/hardhat/contracts/CommitmentVerifier.sol

  ⚠️  For production: run a multi-party ceremony with
      at least 3 independent contributions before deploying.
═══════════════════════════════════════════════════
