/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { ThemeProvider, Input, Button } from 'react-native-elements';
// import { PushNotification } from 'react-native-push-notification';
// import RNFetchBlob from 'rn-fetch-blob';
import {
    ScrollView,
    Alert,
    View,
    // PermissionsAndroid
} from 'react-native';
import Util from '../common/Util';
import Cabecalho from '../common/CabecalhoTela';
import AreaBotoes from '../common/AreaBotoes';
import { styles, theme } from '../common/Estilos';
import GerenciadorDadosApp from '../common/GerenciadorDadosApp';

export default class TelaClienteInicio extends Component {
	
    constructor(props) {
        super(props);
        
        // var PushNotification = require("react-native-push-notification");
        // PushNotification.localNotificationSchedule({
        //     //... You can use all the options from localNotifications
        //     message: "My Notification Message", // (required)
        //     date: new Date(Date.now() + 1000) // in 60 secs
        //   });
        
        this.obterCliente = this.obterCliente.bind(this);
        this.irParaTestesRapidos = this.irParaTestesRapidos.bind(this);
        // this.solicitarPermissoes = this.solicitarPermissoes.bind(this);
        this.tratarDadosCliente = this.tratarDadosCliente.bind(this);

        oUtil = new Util();
        oGerenciadorDadosApp = new GerenciadorDadosApp(this);
        oDadosApp = oGerenciadorDadosApp.getDadosApp();
        oDadosControleApp = oGerenciadorDadosApp.getDadosControleApp();

        this.state = oGerenciadorDadosApp.getDadosAppGeral();
        
       // this.solicitarPermissoes();
    }
    

    // async solicitarPermissoes(){
    //     try {
    //         const granted = await PermissionsAndroid.request(
    //           PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    //           {
    //             title: "Storage Permission",
    //             message: "App needs access to memory to download the file "
    //           }
    //         );
    //         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //           Alert.alert("Permission granted","Now you can download anything!");
    //         } else {
    //           Alert.alert(
    //             "Permission Denied!",
    //             "You need to give storage permission to download the file"
    //           );
    //         }
    //       } catch (err) {
    //         console.warn(err);
    //       }
    // }

    obterCliente() {
        try {
            let url = oUtil.getURL('/clientes/obter/');

            oDadosControleApp.processando_requisicao = true;
            oGerenciadorDadosApp.atualizarEstadoTela(this);

            fetch(url, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state),
              })
                .then(oUtil.obterJsonResposta)
                .then((oJsonDados) => {
                    oUtil.tratarRetornoServidor(oJsonDados, this.tratarDadosCliente, true);
                })
                .catch(function (erro) {
                    Alert.alert(erro.message);
                    throw erro;
                });
        } catch (exc) {
            Alert.alert(exc.message);
            throw exc;
        }
    }

    tratarDadosCliente(oDados, oEstado) {
        
        let oDadosAppGeral = this.state;

        if(oEstado.cod_mensagem === 'NaoCadastrado') {
            Alert.alert('Seu cadastro não foi localizado. Preencha os dados solicitados para realizá-lo.');
        } else if (oEstado.mensagem && oEstado.mensagem.trim()) {
            Alert.alert(oEstado.mensagem);
        }
        if(oDados) {
            
            oDadosAppGeral = oGerenciadorDadosApp.atribuirDados('cliente', oDados);
        }

        oDadosControleApp.processando_requisicao = false;
        oGerenciadorDadosApp.atualizarEstadoTela(this);

        oGerenciadorDadosApp.irPara('Dados pessoais', oDadosAppGeral);
    }

    tratarDadosBoleto(oDados, oEstado) {
        if (oEstado.mensagem && oEstado.mensagem.trim()) {
            Alert.alert(oEstado.mensagem);
        }
        if(oDados && oDados.url_pdf) {
            
            this.baixarPDFBoleto(oDados.url_pdf);
        } else {
            Alert.alert('Sem dados boleto.');
        }
    }

    irParaTestesRapidos() {

        oGerenciadorDadosApp.irPara('Testes', this.state);
    }

    botaoIniciar = () => <Button title="Iniciar" onPress={this.obterCliente} loading={oDadosControleApp.processando_requisicao}></Button>;
    botaoTestesRapidos = () => <Button title="Testes Rápidos" onPress={this.irParaTestesRapidos} ></Button>;

    render() {
        let botoesTela = [ { element: this.botaoIniciar }, { element: this.botaoTestesRapidos} ];

        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Cadastro' nomeTela='Início' />
                <AreaDados dadosApp={oDadosApp}/>
                <AreaBotoes botoes={botoesTela} />
            </View>
        );
    }
}

export class AreaDados extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosCliente = oDadosApp.cliente;

        return (
            <ScrollView>
                <ThemeProvider theme={theme}>
                    <View style={styles.areaDadosCliente}>
                        <Input placeholder="Informe seu E-Mail" label="E-Mail" value={oDadosCliente.email} onChangeText={(valor) => { oDadosCliente.email = valor; this.setState(this.props)}}></Input>
                        <Input placeholder="Informe seu CPF" label="CPF" value={oDadosCliente.cpf} onChangeText={(valor) => { oDadosCliente.cpf = valor; this.setState(this.props)}}></Input>
                    </View>
                </ThemeProvider>
            </ScrollView>
        );
    }
}
// gerarBoleto() {
//     try {
//         let oDadosAppGeral = this.state;            
//         let url = oUtil.getURL('/boletos/gerarBoleto/');

//         oDadosAppGeral.processando_requisicao = true;
//         this.setState(oDadosAppGeral);

//         fetch(url, {
//             method: 'POST',
//             headers: {
//               Accept: 'application/json',
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//             }),
//           })
//             .then(oUtil.obterJsonResposta)
//             .then((oJsonDados) => {
//                 oUtil.tratarRetornoServidor(oJsonDados, this.tratarDadosBoleto, true);
//             })
//             .catch(function (erro) {
//                 Alert.alert(erro.message);
//                 throw erro;
//             });
//     } catch (exc) {
//         Alert.alert(exc.message);
//         throw exc;
//     }
// }

// baixarPDFBoleto(){
//     let url = 'https://download.gerencianet.com.br/229576_14_FORAA5/229576-637436-ZENEM8.pdf?sandbox=true';
//     // Documentacao: https://github.com/joltup/rn-fetch-blob/wiki/Manually-Link-Package#index
//     const { config, fs } = RNFetchBlob;
//     let docDir = fs.dirs.DocumentDir; // this is the pictures directory. You can check the available directories in the wiki.
//     let options = {
//         // fileCache: false,
//         // addAndroidDownloads : {
//             useDownloadManager : true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
//             notification : false,
//             path:  "/data/user/0/com.trisafeapp/files/boleto_gernet.pdf", // this is the path where your downloaded file will live in
//             description : 'Baixando boleto.',
//             mime : 'application/pdf',
//         // }
//     }
//     config(options).fetch('GET', url).then((res) => {
//         if(res) {
//             console.log('resp of pdf', res);
//             console.log('The file saved to ', res.path());
//             Alert.alert(res.path());
//         } else {
//             Alert.alert('res vazio');
//         }
//     }).catch((err) => {
//         console.log(err);
//     });
// }