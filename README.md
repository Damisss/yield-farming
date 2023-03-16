# Maximise Yield Amount 

This project demonstrates how to use flash loan in yield farming incensitive. User can leverage flash loan and boost yield farming earnings on Compound Finance protocol. For instance, one can deposit his/her asset (ERC-20 token) plus a certain amount of underlying asset from flash loan. And then instantly borrow flash laon amount from Compound Finance protocol in order to pay back the flash loan (all those mentioned steps should be done in one transaction). In order to minimise the risk of liquitation when borrwing from protocol, user should take into consideration liquidation threshold of underlying asset.
The benefit of this strategy is that the user earns more compound token than if he/she would have supplied only his/her own asset.

# Configure .env file:
Create a .env file, and fill in the following values (refer to the .env.example file):
- ALCHEMY_API_KEY="API_KEY_ETHEREUM_MAINNET"

# Remark
You may emcounter bellow errors. Those errors are related to network timeout or compound protocol.
`ProviderError: Error: VM Exception while processing transaction: reverted with reason string 'OperationImpl: Market is closing <3>'`
`timeout error`

# Run a demo

1. Clone the repo into a directory
- cd into the directory
- execute commands:
```console
npm install
```
2. Deployment  and run
- cd into the directory
- execute command:
```console
npm run fork
```
- open a new terminal
- cd into the directory
- execute commands:
```console
npm run demo
```

# Run tests
- cd into the directory
- execute command:
```console
npm run fork
```
- open a new terminal 
- cd into the directory
- execute command:
```console
npm run test
```