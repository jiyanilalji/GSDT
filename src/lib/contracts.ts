import { Contract } from 'ethers';
import { useContract, useProvider, useSigner } from 'wagmi';
import GSDT_ABI from '../contracts/GSDT.json';

export const GSDT_ADDRESS = '0x892404Da09f3D7871C49Cd6d6C167F8EB176C804';

export function useGSDTContract() {
  const provider = useProvider();
  const { data: signer } = useSigner();

  return useContract({
    address: GSDT_ADDRESS,
    abi: GSDT_ABI.abi,
    signerOrProvider: signer || provider,
  }) as Contract;
}