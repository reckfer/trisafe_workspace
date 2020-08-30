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
    Text,
    View,
    // PermissionsAndroid
} from 'react-native';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import Cabecalho from '../common/CabecalhoTela';
import { styles, theme } from '../common/Estilos';
import { ContextoApp } from '../contexts/ContextoApp';

export default class TelaVeiculoInicio extends Component {
    
    constructor(props, value) {
        super(props);
        
        // var PushNotification = require("react-native-push-notification");
        // PushNotification.localNotificationSchedule({
        //     //... You can use all the options from localNotifications
        //     message: "My Notification Message", // (required)
        //     date: new Date(Date.now() + 1000) // in 60 secs
        //   });

        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaMenuInicio.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp, this);

            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        // this.irParaMeusDados = this.irParaMeusDados.bind(this);
        // this.irParaMeusVeiculos = this.irParaMeusVeiculos.bind(this);

        this.oRegistradorLog.registrar('TelaMenuInicio.constructor() => Finalizou.');
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

    irParaMeusDados() {
        // this.oGerenciadorContextoApp.setTelaAnterior(this);
        this.oNavegacao.navigate('Cadastro', this.state);
    }

    irParaMeusVeiculos() {
        // this.oGerenciadorContextoApp.setTelaAnterior(this);
        this.oNavegacao.navigate('Veiculos', this.state);
    }

    botaoIrParaMeusDados = () => <Button title="Meus dados" onPress={this.irParaMeusDados}></Button>;
    botaoIrParaMeusVeiculos = () => <Button title="Meus Veículos" onPress={this.irParaMeusVeiculos} ></Button>;

    // <View style={{flex: 1, flexDirection: 'column' }}>
    //                     <View style={{flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
    //                         <Button title="Meus dados" onPress={oFuncoes.irParaTesteCadastroIter} ></Button>
    //                     </View>
    //                     <View style={{flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
    //                         <Button title="Meus Veículos" onPress={oFuncoes.irParaTesteGeraContratoPDF}></Button>
    //                     </View>
    //                 </View>

    render() {
        let botoesTela = [ { element: this.botaoIrParaMeusDados }, { element: this.botaoIrParaMeusVeiculos} ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Meus veículos' nomeTela='Início' navigation={this.oNavegacao} />
                <AreaDados botoes={botoesTela} />
            </View>
        )
    }
}

TelaVeiculoInicio.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        
        return (
            <ScrollView>
                <ThemeProvider theme={theme}>
                    <View >
                        <Text>A ser desenvolvido...</Text>
                    </View>
                </ThemeProvider>
            </ScrollView>
        );
    }
}