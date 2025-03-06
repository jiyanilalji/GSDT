import { Contract } from 'ethers';
import { useProvider, useSigner } from '../utils/web3';
import GSDT_ABI from '../contracts/GSDT.json';

const GSDT_ADDRESS = '0x892404Da09f3D7871C49Cd6d6C167F8EB176C804';

export function useGSDTContract() {
  const provider = useProvider();
  const signer = useSigner();

  if (!provider) return null;

  return new Contract(
    GSDT_ADDRESS,
    GSDT_ABI.abi,
    signer || provider
  );
}