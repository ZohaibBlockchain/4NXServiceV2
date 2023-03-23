
export function domain(inf)
{
 return EIP712Domain = {
    name: inf.name,
    version: inf.version,
    chainId: inf.chainId,
    verifyingContract: inf.verifyingContract, // Address of the smart contract that will verify the signature
};
}
//0xd66c804d37f5e314730b7d3a69210bb770414289 Testnet Address...


export const types = {
    INF: [
        { name: 'tradeID', type: 'uint256' },
        { name: 'price', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'blockRange', type: 'uint256'},
        { name: 'user', type: 'address' },
        { name: 'token', type: 'address' },
    ]
};



export function val(inf)
{
   return inf = {
        tradeID: inf.tradeID,
        price:inf.price,
        amount:inf.amount,
        blockRange:inf.blockRange,
        user:inf.user,
        token:inf.token
    };
}



export async function signMessage() {
    const privateKey = '0x92cff59d2ed16de4c86a7304a6211a3a093e1d011e11ddf6abfdcdf0f5ac6233';
    const signer = new ethers.Wallet(privateKey);
    const signature = await signer._signTypedData(EIP712Domain, types, val(inf));
    const { r, s, v } = ethers.utils.splitSignature(signature);
    console.log(`r: ${r}`);
    console.log(`s: ${s}`);
    console.log(`v: ${v}`);
    return {r:r,s:s,v:v};
}