import React, { Component } from "react";
import { Button, Typography, Grid, TextField } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

// Import json file for artifact
import DisasterRiskInsurance from "./contracts/DisasterRiskInsurance.json";
import BeneficiaryRegistry from "./contracts/BeneficiaryRegistry.json";
import DisasterAreaRegistry from "./contracts/DisasterAreaRegistry.json";


import getWeb3 from "./utils/getWeb3";

import { theme } from './utils/theme';
import Header from './components/Header';
import HeaderDisasterRisk from './components/HeaderDisasterRisk.js';

import "./App.css";

const GAS = 500000;
const GAS_PRICE = "20000000000";


class App extends Component {
    constructor(props) {    
        super(props);

        this.state = { 
            web3: null, 
            accounts: null,

            //// Disaster Risk Insurance   
            disaster_risk_insurance: null,
            beneficiary_registry: null,
            disaster_area_registry: null,
            totalFundPool: 0,
            totalFundIndividual: 0,
            fundAmount: 0,
            walletAddress: "",
            ipAddress: "",
        };
    }

    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();

            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            if (networkId !== 3) {
                throw new Error("Select the Ropsten network from your MetaMask plugin");
            }

            const deployedNetworkDisasterRiskInsurance = DisasterRiskInsurance.networks[networkId];
            const disaster_risk_insurance = new web3.eth.Contract(
                DisasterRiskInsurance.abi,
                deployedNetworkDisasterRiskInsurance && deployedNetworkDisasterRiskInsurance.address,
            );

            const deployedNetworkBeneficiaryRegistry = BeneficiaryRegistry.networks[networkId];
            const beneficiary_registry = new web3.eth.Contract(
                BeneficiaryRegistry.abi,
                deployedNetworkBeneficiaryRegistry && deployedNetworkBeneficiaryRegistry.address,
            );

            const deployedNetworkDisasterAreaRegistry = DisasterAreaRegistry.networks[networkId];
            const disaster_area_registry = new web3.eth.Contract(
                DisasterAreaRegistry.abi,
                deployedNetworkDisasterAreaRegistry && deployedNetworkDisasterAreaRegistry.address,
            );

            this.setState({ 
              web3, 
              accounts, 
              disaster_risk_insurance: disaster_risk_insurance,
              beneficiary_registry: beneficiary_registry,
              disaster_area_registry: disaster_area_registry
            });

            window.ethereum.on('accountsChanged', async (accounts) => {
                const newAccounts = await web3.eth.getAccounts();
                this.setState({ accounts: newAccounts });
            });

            // Refresh on-chain data every 1 second
            const component = this;
            async function loopRefresh() {
                await component.refreshDisasterState();
                setTimeout(loopRefresh, 1000);
            }
            loopRefresh();

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };


    /***********************************************************************
     * Disaster Risk Insurance Project
     ***********************************************************************/
    refreshDisasterState = async () => {
        const { accounts, disaster_risk_insurance } = this.state;

        const totalFundPool = await this.state.web3.utils.fromWei(await disaster_risk_insurance.methods.totalFundPool().call());

        const totalFundIndividual = await this.state.web3.utils.fromWei(await disaster_risk_insurance.methods.getFundAmount(true).call({ from: accounts[0] }));

        const resultCityReceived = await disaster_risk_insurance.methods.resultCityReceived().call();
        const resultLatitudeReceived = await disaster_risk_insurance.methods.resultLatitudeReceived().call();
        const resultLongitudeReceived = await disaster_risk_insurance.methods.resultLongitudeReceived().call();
        // console.log('=== resultCityReceived ===', resultCityReceived);
        // console.log('=== resultLatitudeReceived ===', resultLatitudeReceived);
        // console.log('=== resultLongitudeReceived ===', resultLongitudeReceived);

        const resultCity = await disaster_risk_insurance.methods.resultCity().call();
        const resultLatitude = await disaster_risk_insurance.methods.resultLatitude().call();
        const resultLongitude = await disaster_risk_insurance.methods.resultLongitude().call();
        // console.log('=== resultCity ===', this.state.web3.utils.hexToString(resultCity));
        // console.log('=== resultLatitude ===', resultLatitude);
        // console.log('=== resultLongitude ===', resultLongitude);

        var resultMessage;
        // if (resultReceived) {
        //     if (result) {
        //         resultMessage = "Result is complete fund";
        //     }
        //     else {
        //         resultMessage = "Result is not complete fund";
        //     }
        // }
        // else {
        //     resultMessage = "Result has not been received yet";
        // }

        this.setState({ 
          totalFundPool, 
          totalFundIndividual,
          resultCityReceived,
          resultLatitudeReceived,
          resultLongitudeReceived,
          //result,
          resultCity,
          resultLatitude,
          resultLongitude,
          resultMessage
        });
    }

    handleUpdateFundForm = (name, value) => {
        this.setState({ [name]: value });
    }

    handleFund = async (fundResultString) => {
        const { accounts, disaster_risk_insurance } = this.state;

        this.setState({ message: 'Placing fund...' });

        var fundResult;
        if (fundResultString === "true") {
            fundResult = true;
        }
        else if (fundResultString === "false") {
            fundResult = false;
        }

        try {
            await disaster_risk_insurance.methods.fundInsurance(fundResult).send({ from: accounts[0], 
                                                                                   value: this.state.web3.utils.toWei(this.state.fundAmount), 
                                                                                   gas: GAS, 
                                                                                   gasPrice: GAS_PRICE });
            this.refreshDisasterState();
            //this.refreshState();
            this.setState({ message: 'Fund placed' });
        } catch (error) {
            console.error(error);
            this.setState({ message: 'Failed placing the fund' });
        }
    }

    handleRequestResultsOfDisasterRisk = async () => {
        const { accounts, 
                disaster_risk_insurance, 
                beneficiary_registry, 
                disaster_area_registry, 
                beneficiaryList, 
                disasterAreaList } = this.state;

        /***** Call IP-address and disaster area from struct *****/
        // [In progress]
        const beneficiaries = await beneficiary_registry.methods.getBeneficiaryList().call();
        console.log('=== beneficiaries ===', beneficiaries);

        const areas = await disaster_area_registry.methods.getDisasterAreaList().call();
        console.log('=== areas ===', areas);

        // this.setState({
        //   beneficiaryList: beneficiaries,
        //   disasterAreaList: areas
        // });

        /***** Check match wallet address and ip adress of login user. *****/
        let b;
        let loginUserWalletAddr;
        let loginUserIpAddress;
        for (b = 0; b < beneficiaries.length; b++) {
          if (accounts[0] == beneficiaries[b].walletAddr) {
            loginUserWalletAddr = beneficiaries[b].walletAddr;
            loginUserIpAddress = beneficiaries[b].ipAddress;
            console.log('=== Wallet address of login user ===', beneficiaries[b].walletAddr, beneficiaries[b].ipAddress);
          } else {
            console.log('=== Nothing to match ===')
          }
        }

        /***** Send request and get response cityName of disaster area *****/ 
        let city;
        let latitude;
        let longitude;

        let resultCity;
        let resultLatitude;
        let resultLongitude;

        const lastBlock = await this.state.web3.eth.getBlock("latest");
        this.setState({ message: "Requesting the result from the oracle..." });
        try {
            city = await disaster_risk_insurance.methods.requestResultOfCity(loginUserIpAddress).send({ from: accounts[0], 
                                                                                                        gas: GAS, 
                                                                                                        gasPrice: GAS_PRICE });
            latitude = await disaster_risk_insurance.methods.requestResultOfLatitude(loginUserIpAddress).send({ from: accounts[0], 
                                                                                                                gas: GAS, 
                                                                                                                gasPrice: GAS_PRICE });
            longitude = await disaster_risk_insurance.methods.requestResultOfLongitude(loginUserIpAddress).send({ from: accounts[0], 
                                                                                                                  gas: GAS, 
                                                                                                                  gasPrice: GAS_PRICE });
            console.log('=== city ===', city);
            console.log('=== latitude ===', city);
            console.log('=== longitude ===', city);

            resultCity = await disaster_risk_insurance.methods.resultCity().call();
            resultLatitude = await disaster_risk_insurance.methods.resultLatitude().call();
            resultLongitude = await disaster_risk_insurance.methods.resultLongitude().call();
            console.log('=== resultCity ===', this.state.web3.utils.hexToString(resultCity));
            console.log('=== resultLatitude ===', resultLatitude);
            console.log('=== resultLongitude ===', resultLongitude);

            while (true) {
                const responseEvents = await disaster_risk_insurance.getPastEvents('ChainlinkFulfilled', { fromBlock: lastBlock.number, toBlock: 'latest' });
                console.log('=== responseEvents ===', responseEvents)
                if (responseEvents.length !== 0) {
                    break;
                }
            }

            await this.refreshDisasterState();
            //this.refreshState();
            await this.setState({ message: "The result is delivered" });
        } catch (error) {
            console.error(error);
            this.setState({ message: "Failed getting the result" });
        }
        
        /***** Check whether cityName is disaster area or not *****/
        console.log('=== resultCity / condition ===', this.state.web3.utils.hexToString(resultCity))      // Test
        
        console.log('=== areas[0].cityName ===', areas[0].cityName)      // Test
        console.log('=== areas[0].isDisaster ===', areas[0].isDisaster)  // Test

        console.log('=== areas[1].cityName ===', areas[1].cityName)      // Test
        console.log('=== areas[1].isDisaster ===', areas[1].isDisaster)  // Test
        console.log('=== areas[2].cityName ===', areas[2].cityName)      // Test
        console.log('=== areas[2].isDisaster ===', areas[2].isDisaster)  // Test
        
        let a;
        for (a = 0; a < areas.length; a++) {
          if (this.state.web3.utils.hexToString(resultCity) == areas[a].cityName) {
            if (areas[a].isDisaster == true) {
              // Get right of receiving money from fund pool
              console.log('=== City of login user is disaster area (True) ===');

              // Execute withdraw from fund pool
              this.handleWithdrawFromFundPool();
            } else {
              console.log('=== City of login user is not disaster area (False) ===')
            }
          } else {
            console.log('=== Nothing to match ===')
          }
        }

    }

    handleWithdrawFromFundPool = async () => {
        const { accounts, disaster_risk_insurance } = this.state;

        try {
            const balanceBefore = await this.state.web3.utils.fromWei(await this.state.web3.eth.getBalance(accounts[0]));
            await disaster_risk_insurance.methods.withdrawFromFundPool().send({ from: accounts[0], gas: GAS, gasPrice: GAS_PRICE });
            const balanceAfter = await this.state.web3.utils.fromWei(await this.state.web3.eth.getBalance(accounts[0]))

            this.refreshDisasterState();
            this.setState({ message: `You received ${balanceAfter - balanceBefore} ETH` });
        }
        catch (error) {
            console.error(error);
            this.setState({ message: "Failed withdrawing" });
        }
    }

    handleBeneficiaryRegistry = async () => {
        const { accounts, beneficiary_registry, walletAddress, ipAddress } = this.state;
        try {
            //let walletAddr = accounts[0];
            //let ipAddress = "185.199.104.14";
            const response = await beneficiary_registry.methods.createBeneficiary(walletAddress, ipAddress).send({ from: accounts[0] });
            console.log("=== createBeneficiary ===", response)
    
            // @notice After it return response above, it initialize value which on form. 
            await this.setState({
                    walletAddress: '', 
                    ipAddress: '', 
                  });

            await this.setState({ message: "Success to create beneficiary" });
        }
        catch (error) {
            console.error(error);
            this.setState({ message: "Failed withdrawing" });
        }   
    }

    handleDisasterAreaRegistry = async () => {
        const { accounts, disaster_area_registry } = this.state;
        try {
            // This is seed data for specify argument in createDisasterArea method
            let _cityName_1 = "Blackheath";  // London / { "ip": "192.138.1.0" }
            let _isDisaster_1 = false;

            let _cityName_2 = "Bushwick";  // NewYork / { "ip": "167.153.150.0" }
            let _isDisaster_2 = false;

            let _cityName_3 = "Paris";    // Paris / { "ip": "176.31.84.249" }
            let _isDisaster_3 = true;

            const response_1 = await disaster_area_registry.methods.createDisasterArea(_cityName_1, _isDisaster_1).send({ from: accounts[0] });
            const response_2 = await disaster_area_registry.methods.createDisasterArea(_cityName_2, _isDisaster_2).send({ from: accounts[0] });
            const response_3 = await disaster_area_registry.methods.createDisasterArea(_cityName_3, _isDisaster_3).send({ from: accounts[0] });
            console.log("=== createDisasterArea 1 ===", response_1)
            console.log("=== createDisasterArea 2 ===", response_2)
            console.log("=== createDisasterArea 3 ===", response_3)
    
            this.setState({ message: "Success to create disaster area" });
        }
        catch (error) {
            console.error(error);
            this.setState({ message: "Failed withdrawing" });
        }   
    }


    render() {
        if (!this.state.web3) {
            return (
                <ThemeProvider theme={theme}>
                    <div className="App">
                        <Header />
                        <Typography>
                            Loading Web3, accounts, and contract...
          </Typography>
                    </div>
                </ThemeProvider>
            );
        }
        return (
            <ThemeProvider theme={theme}>
                <div className="App">
                    <HeaderDisasterRisk />
                    <Typography variant="h5" style={{ marginTop: 32 }}>
                        Disaster Risk Insurance
                    </Typography>
                    <Typography variant="h5" style={{ marginTop: 32 }}>
                        {this.state.resultMessage}
                    </Typography>


                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={6}>
                        <Typography variant="h5">
                                Fund rule for this insurance
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h5">
                                Fund 0.1ETH ~ 0.5ETH per month as premiums
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={6}>
                            <Typography variant="h5">
                                {"Total amount of Fund Pool"}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {`${this.state.totalFundPool}`}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs={6}>
                            <Typography variant="h5">
                                {"Total amount of Fund Individual"}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {`${this.state.totalFundIndividual}`}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={6}>
                            <Typography variant="h5">
                                {"Fund amount of premiums / monthly"}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id="bet-amount"
                                className="input"
                                value={this.state.fundAmount}
                                onChange={e => this.handleUpdateFundForm('fundAmount', e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={6}>
                           You can fund premiums between 0.1ETH ~ 0.5ETH. <br />
                           In case it happen disaster in your city, you can receive 2 times insurance money which you funded premiums until previous time of happening disaster.
                        </Grid>
                        <Grid item xs={1}>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" onClick={() => this.handleFund("true")}>
                               Fund premiums
                            </Button>
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={6}>
                            If result of request that your city name which called by registerd IP address match with city name of disaster area, you can receive withdrawed insurance money from fund pool of premiums automatically by smart contract. 
                        </Grid>
                        <Grid item xs={1}>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" onClick={() => this.handleRequestResultsOfDisasterRisk()}>
                                Request Claim of insurance money
                            </Button>
                        </Grid>
                    </Grid>

                    <Typography variant="h5" style={{ marginTop: 32 }}>
                        {this.state.message}
                    </Typography>

                    <hr />

                    <Typography variant="h5" style={{ marginTop: 32 }}>
                        Register Benefically
                    </Typography>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {"Wallet Address"}
                            </Typography>
                        </Grid>                   
                        <Grid item xs={6}>
                            <TextField
                                id="bet-amount"
                                className="input"
                                value={this.state.walletAddress}
                                onChange={e => this.handleUpdateFundForm('walletAddress', e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {"IP Address"}
                            </Typography>
                        </Grid>   
                        <Grid item xs={6}>
                            <TextField
                                id="bet-amount"
                                className="input"
                                value={this.state.ipAddress}
                                onChange={e => this.handleUpdateFundForm('ipAddress', e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={4}>
                        </Grid>

                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" onClick={() => this.handleBeneficiaryRegistry()}>
                                Create Beneficiary
                            </Button>
                        </Grid>
                    </Grid>

                    <hr />

                    <Typography variant="h5" style={{ marginTop: 32 }}>
                        Register Disaster Area
                    </Typography>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={4}>
                        </Grid>

                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" onClick={() => this.handleDisasterAreaRegistry()}>
                                Create Disaster Area
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </ThemeProvider>
        );
    }
}

export default App;
