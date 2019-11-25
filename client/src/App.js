import React, { Component } from "react";
import { Button, Typography, Grid, TextField } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

// Import json file for artifact
import HoneycombBetPool from "./contracts/HoneycombBetPool.json";
import FlightDelayInsurance from "./contracts/FlightDelayInsurance.json";
import DisasterRiskInsurance from "./contracts/DisasterRiskInsurance.json";

import getWeb3 from "./utils/getWeb3";

import { theme } from './utils/theme';
import Header from './components/Header';
import HeaderFlightDelay from './components/HeaderFlightDelay.js';
import HeaderDisasterRisk from './components/HeaderDisasterRisk.js';

import "./App.css";

const GAS = 500000;
const GAS_PRICE = "20000000000";

class App extends Component {
    state = { 
        web3: null, 
        accounts: null,

        //// Disaster Risk Insurance   
        disaster_risk_insurance: null,
        totalFundTrue: 0,
        myFundTrue: 0,
        fundAmount: 0,

        //// Honeycomb Example Project
        contract: null, 
        betAmount: 0 
    };

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

            const deployedNetwork = HoneycombBetPool.networks[networkId];
            const contract = new web3.eth.Contract(
                HoneycombBetPool.abi,
                deployedNetwork && deployedNetwork.address,
            );

            const deployedNetworkDisasterRiskInsurance = DisasterRiskInsurance.networks[networkId];
            const disaster_risk_insurance = new web3.eth.Contract(
                DisasterRiskInsurance.abi,
                deployedNetworkDisasterRiskInsurance && deployedNetworkDisasterRiskInsurance.address,
            );

            this.setState({ 
              web3, 
              accounts, 
              contract: contract, 
              disaster_risk_insurance: disaster_risk_insurance 
            });

            window.ethereum.on('accountsChanged', async (accounts) => {
                const newAccounts = await web3.eth.getAccounts();
                this.setState({ accounts: newAccounts });
            });

            // Refresh on-chain data every 1 second
            const component = this;
            async function loopRefresh() {
                await component.refreshState();
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
        const { disaster_risk_insurance } = this.state;

        const totalFundTrue = await this.state.web3.utils.fromWei(await disaster_risk_insurance.methods.totalFundTrue().call());

        const myFundTrue = await this.state.web3.utils.fromWei(await disaster_risk_insurance.methods.getFundAmount(true).call({ from: this.state.accounts[0] }));

        const resultReceived = await disaster_risk_insurance.methods.resultReceived().call();
        const result = await disaster_risk_insurance.methods.result().call();

        var resultMessage;
        if (resultReceived) {
            if (result) {
                resultMessage = "Result is complete fund";
            }
            else {
                resultMessage = "Result is not complete fund";
            }
        }
        else {
            resultMessage = "Result has not been received yet";
        }

        this.setState({ totalFundTrue, myFundTrue, resultReceived, result, resultMessage });
    }

    handleUpdateFundForm = (name, value) => {
        this.setState({ [name]: value });
    }

    handleFund = async (fundResultString) => {
        //const { disaster_risk_insurance } = this.state;

        this.setState({ message: 'Placing fund...' });

        var fundResult;
        if (fundResultString === "true") {
            fundResult = true;
        }
        else if (fundResultString === "false") {
            fundResult = false;
        }

        try {
            await this.state.disaster_risk_insurance.methods.fundInsurance(fundResult).send({ from: this.state.accounts[0], value: this.state.web3.utils.toWei(this.state.fundAmount), gas: GAS, gasPrice: GAS_PRICE });
            //await disaster_risk_insurance.methods.fundInsurance(fundResult).send({ from: this.state.accounts[0], value: this.state.web3.utils.toWei(this.state.fundAmount), gas: GAS, gasPrice: GAS_PRICE });
            this.refreshDisasterState();
            //this.refreshState();
            this.setState({ message: 'Fund placed' });
        } catch (error) {
            console.error(error);
            this.setState({ message: 'Failed placing the fund' });
        }
    }

    handleRequestResultsOfDisasterRisk = async () => {
        //const { disaster_risk_insurance } = this.state;
        let ipAddress = "194.199.104.14"

        let ListOfAreaOfDisaster = ["194.199.104.14", "181.199.101.12", "173.124.111.16"]

        /***** Judge area whehter area of disaster or not *****/
        let isDisaster;
        if (ListOfAreaOfDisaster.indexOf(ipAddress) !== -1) {
          isDisaster = true
        } else {
          isDisaster = false
        }

        /***** Execute requestResult method depend on whehter area of disaster or not *****/
        if (isDisaster == true) {
          this.setState({ message: "Area of your IP address is area of disaster" })

          const lastBlock = await this.state.web3.eth.getBlock("latest");
          this.setState({ message: "Requesting the result from the oracle..." });
          try {
              await this.state.disaster_risk_insurance.methods.requestResultOfDisasterRisk().send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
              //await disaster_risk_insurance.methods.requestResultOfDisasterRisk().send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
              while (true) {
                  const responseEvents = await this.state.disaster_risk_insurance.getPastEvents('ChainlinkFulfilled', { fromBlock: lastBlock.number, toBlock: 'latest' });
                  //const responseEvents = await disaster_risk_insurance.getPastEvents('ChainlinkFulfilled', { fromBlock: lastBlock.number, toBlock: 'latest' });
                  console.log('=== responseEvents ===', responseEvents)
                  if (responseEvents.length !== 0) {
                      break;
                  }
              }

              let disaster_risk_insurance = await this.state.disaster_risk_insurance.resultReceived();
              //let disaster_risk_insurance = await disaster_risk_insurance.resultReceived();
              let result = await this.state.disaster_risk_insurance.result();
              //let result = await disaster_risk_insurance.result();
              console.log(`=== Final result: ${result.toString()} ===`);

              this.refreshDisasterState();
              //this.refreshState();
              this.setState({ message: "The result is delivered" });
          } catch (error) {
              console.error(error);
              this.setState({ message: "Failed getting the result" });
          }

        } else {
          this.setState({ message: "Area of your IP address is not area of disaster" })
        }
    }

    handleWithdrawFromFundPool = async () => {
        //const { disaster_risk_insurance } = this.state;
        try {
            const balanceBefore = await this.state.web3.utils.fromWei(await this.state.web3.eth.getBalance(this.state.accounts[0]));
            await this.state.disaster_risk_insurance.methods.withdrawFromFundPool().send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
            //await disaster_risk_insurance.methods.withdrawFromFundPool().send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
            const balanceAfter = await this.state.web3.utils.fromWei(await this.state.web3.eth.getBalance(this.state.accounts[0]))

            this.refreshDisasterState();
            //this.refreshState();
            this.setState({ message: `You received ${balanceAfter - balanceBefore} ETH` });
        }
        catch (error) {
            console.error(error);
            this.setState({ message: "Failed withdrawing" });
        }
    }




    /***********************************************************************
     * Honeycomb Example Project
     ***********************************************************************/
    refreshState = async () => {
        const totalBetTrue = await this.state.web3.utils.fromWei(await this.state.contract.methods.totalBetTrue().call());
        const totalBetFalse = await this.state.web3.utils.fromWei(await this.state.contract.methods.totalBetFalse().call());

        const myBetTrue = await this.state.web3.utils.fromWei(await this.state.contract.methods.getBetAmount(true).call({ from: this.state.accounts[0] }));
        const myBetFalse = await this.state.web3.utils.fromWei(await this.state.contract.methods.getBetAmount(false).call({ from: this.state.accounts[0] }));

        const resultReceived = await this.state.contract.methods.resultReceived().call();
        const result = await this.state.contract.methods.result().call();

        var resultMessage;
        if (resultReceived) {
            if (result) {
                resultMessage = "Result is 6";
            }
            else {
                resultMessage = "Result is not 6";
            }
        }
        else {
            resultMessage = "Result has not been received yet";
        }

        this.setState({ totalBetTrue, totalBetFalse, myBetTrue, myBetFalse, resultReceived, result, resultMessage });
    }

    handleUpdateForm = (name, value) => {
        this.setState({ [name]: value });
    }

    handleRequestResults = async () => {
        const lastBlock = await this.state.web3.eth.getBlock("latest");
        this.setState({ message: "Requesting the result from the oracle..." });
        try {
            await this.state.contract.methods.requestResult().send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
            while (true) {
                const responseEvents = await this.state.contract.getPastEvents('ChainlinkFulfilled', { fromBlock: lastBlock.number, toBlock: 'latest' });
                console.log("=== responseEvents ===", responseEvents);
                if (responseEvents.length !== 0) {
                    break;
                }
            }
            this.refreshState();
            this.setState({ message: "The result is delivered" });
        } catch (error) {
            console.error(error);
            this.setState({ message: "Failed getting the result" });
        }
    }

    handleWithdraw = async () => {
        try {
            const balanceBefore = await this.state.web3.utils.fromWei(await this.state.web3.eth.getBalance(this.state.accounts[0]));
            await this.state.contract.methods.withdraw().send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
            const balanceAfter = await this.state.web3.utils.fromWei(await this.state.web3.eth.getBalance(this.state.accounts[0]))
            this.refreshDisasterState();
            this.setState({ message: `You received ${balanceAfter - balanceBefore} ETH` });
        }
        catch (error) {
            console.error(error);
            this.setState({ message: "Failed withdrawing" });
        }
    }

    handleBet = async (betResultString) => {
        this.setState({ message: 'Placing bet...' });

        var betResult;
        if (betResultString === "true") {
            betResult = true;
        }
        else if (betResultString === "false") {
            betResult = false;
        }

        try {
            await this.state.contract.methods.bet(betResult).send({ from: this.state.accounts[0], value: this.state.web3.utils.toWei(this.state.betAmount), gas: GAS, gasPrice: GAS_PRICE });
            this.refreshDisasterState();
            this.setState({ message: 'Bet placed' });
        } catch (error) {
            console.error(error);
            this.setState({ message: 'Failed placing the bet' });
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
                    <Header />
                    <Typography variant="h5" style={{ marginTop: 32 }}>
                        Oracle is going to return a number between 1 and 6
                    </Typography>
                    <Typography variant="h5" style={{ marginTop: 32 }}>
                        {this.state.resultMessage}
                    </Typography>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={3}>
                        <Typography variant="h5">
                                Betting on
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                6
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                Not 6
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {"Total bets"}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {`${this.state.totalBetTrue}`}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {`${this.state.totalBetFalse}`}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {"Your bets"}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {`${this.state.myBetTrue}`}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {`${this.state.myBetFalse}`}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {"Bet amount"}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id="bet-amount"
                                className="input"
                                value={this.state.betAmount}
                                onChange={e => this.handleUpdateForm('betAmount', e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={3}>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" onClick={() => this.handleBet("true")}>
                                Bet on 6
                            </Button>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" onClick={() => this.handleBet("false")}>
                                Bet on not 6
                            </Button>
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={3}>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" onClick={() => this.handleRequestResults()}>
                                Request result
                            </Button>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" onClick={() => this.handleWithdraw()}>
                                Withdraw winnings
                            </Button>
                        </Grid>
                    </Grid>

                    <Typography variant="h5" style={{ marginTop: 32 }}>
                        {this.state.message}
                    </Typography>
                </div>

                <hr />


                <div className="App">
                    <HeaderDisasterRisk />
                    <Typography variant="h5" style={{ marginTop: 32 }}>
                        Disaster Risk Insurance
                    </Typography>
                    <Typography variant="h5" style={{ marginTop: 32 }}>
                        {this.state.resultMessage}
                    </Typography>


                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={3}>
                        <Typography variant="h5">
                                Fund for insurance
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                1〜5 LINK per month
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {"Total fund"}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {`${this.state.totalFundTrue}`}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {"This month fund"}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {`${this.state.myFundTrue}`}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={3}>
                            <Typography variant="h5">
                                {"Fund amount / this month"}
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
                        <Grid item xs={3}>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" onClick={() => this.handleFund("true")}>
                                Fund amount for this month
                            </Button>
                        </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 32 }}>
                        <Grid item xs={3}>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" onClick={() => this.handleRequestResultsOfDisasterRisk()}>
                                Request result
                            </Button>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="primary" onClick={() => this.handleWithdrawFromFundPool()}>
                                Withdraw from Fund Pool
                            </Button>
                        </Grid>
                    </Grid>

                    <Typography variant="h5" style={{ marginTop: 32 }}>
                        {this.state.message}
                    </Typography>

                </div>
            </ThemeProvider>
        );
    }
}

export default App;
