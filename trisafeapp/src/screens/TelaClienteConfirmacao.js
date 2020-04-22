/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    ScrollView,
    Alert,
    View
} from 'react-native';
import Util from './../common/Util';
import { ThemeProvider, Input, Button } from 'react-native-elements';
import Cabecalho from './../common/CabecalhoTela';
import { styles, theme } from './../common/Estilos';
import AreaBotoes from './../common/AreaBotoes';
import GerenciadorDadosApp from './../common/GerenciadorDadosApp';

export default class TelaClienteConfirmacao extends Component {
	
    constructor(props) {
        super(props);
        
        this.salvar = this.salvar.bind(this);
        this.voltar = this.voltar.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        
        oUtil = new Util(this);
        oGerenciadorDadosApp = new GerenciadorDadosApp(this);
        oDadosApp = oGerenciadorDadosApp.getDadosApp();
        oDadosControleApp = oGerenciadorDadosApp.getDadosControleApp();

        this.state = oGerenciadorDadosApp.getDadosAppGeral();
    }

    salvar() {
        try {
            let url = oUtil.getURL('/clientes/incluir/');
            
            oDadosControleApp.processando_requisicao = true;
            oGerenciadorDadosApp.atualizarEstadoTela(this);

            fetch(url, {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.state)
                  })
                  .then(oUtil.obterJsonResposta)
                  .then((oJsonDados) => {
                      oUtil.tratarRetornoServidor(oJsonDados, this.tratarDadosRetorno);
                  })
        } catch (exc) {
            Alert.alert(exc);
        }
    }

    tratarDadosRetorno(oDados) {

        if(oDados && oDados.id_cliente_iter) {
            Alert.alert("Cod. cliente Iter: " + oDados.id_cliente_iter);
        }

        oDadosControleApp.processando_requisicao = false;
        oGerenciadorDadosApp.atualizarEstadoTela(this);
    }
     
    voltar() {
        oGerenciadorDadosApp.voltar();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
    botaoConfirmar = () => <Button title="Confirmar" onPress={this.salvar} loading={oDadosControleApp.processando_requisicao} ></Button>;

    render() {
        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoConfirmar } ];

        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Cadastro' nomeTela='Confirmação' />
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
                        <Input label="Nome Completo" disabled={true} style={styles.Input} value={oDadosCliente.nome} ></Input>                
                        <Input label="E-mail" disabled={true} style={styles.Input} value={oDadosCliente.email} ></Input>
                        <Input label="CPF" disabled={true} style={styles.Input} value={oDadosCliente.cpf} ></Input>
                        <Input label="Telefone" disabled={true} style={styles.Input} value={oDadosCliente.telefone} ></Input>
                        <Input label="Nome Usuário" disabled={true} style={styles.Input} value={oDadosCliente.nome_usuario} ></Input>
                        <Input label="Rua" disabled={true} style={styles.Input} value={oDadosCliente.rua} ></Input>
                        <Input label="Número" disabled={true} style={styles.Input} value={oDadosCliente.numero} ></Input>
                        <Input label="Complemento" disabled={true} style={styles.Input} value={oDadosCliente.complemento} ></Input>
                        <Input label="Bairro" disabled={true} style={styles.Input} value={oDadosCliente.bairro} ></Input>                
                        <Input label="Cep" disabled={true} style={styles.Input} value={oDadosCliente.cep} ></Input>
                        <Input label="Cidade" disabled={true} style={styles.Input} value={oDadosCliente.cidade} ></Input>
                        <Input label="Estado" disabled={true} style={styles.Input} value={oDadosCliente.uf} ></Input>
                    </View>
                </ThemeProvider>
            </ScrollView>       
        );
    }
}