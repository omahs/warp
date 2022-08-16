import { deploy, invoke, declare } from './tests/testnetInterface';
async function deployPool() {
  const factory = await deploy(
    './warp_output/v3_core/contracts/UniswapV3Factory__WC__UniswapV3Factory_compiled.json',
    [],
  );
  console.log(factory.contract_address);
  const factory_address = factory.contract_address;

  const deploy_info_dai = await deploy(
    './warp_output/example__contracts/dai__WC__Dai_compiled.json',
    [],
  );
  const dai_address = deploy_info_dai.contract_address;
  console.log(dai_address);

  const deploy_info_erc = await deploy(
    './warp_output/example__contracts/ERC20__WC__WARP_compiled.json',
    [],
  );
  const erc20_address = deploy_info_erc.contract_address;
  console.log(erc20_address);

  const pool = await invoke(factory_address!, 'createPool_a1671295', [
    dai_address!,
    erc20_address!,
    '500',
  ]);
}

console.log('Running script');
deployPool();
