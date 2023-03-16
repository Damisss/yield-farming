import { HardhatUserConfig} from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-gas-reporter'

require("dotenv").config();

type HardhatConfig = {
	settings: {
		optimizer: { enabled: boolean, runs: number}
	},
	contractSizer?:{
		alphaSort: boolean,
		disambiguatePaths: boolean,
		runOnCompile: boolean,
		strict: boolean,
		only: string[]
	}
	,
} & HardhatUserConfig

const config: HardhatConfig = {
	solidity: "0.8.17",
	settings: {
		optimizer: {
			enabled: true,
			runs: 2000
		}
	},
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			forking: {
				url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
				enabled:true,
				blockNumber: 16834561
			}
			
		}
		
	}
};

export default config;
