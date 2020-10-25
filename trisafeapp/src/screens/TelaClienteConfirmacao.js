'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    ScrollView,
    View
} from 'react-native';
import { ThemeProvider, Input, Button } from 'react-native-elements';
import Cabecalho from './../common/CabecalhoTela';
import { styles, theme } from './../common/Estilos';
import AreaRodape from './../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import { inicializarContextoComum } from '../common/Configuracao';
import Orientation from 'react-native-orientation';

const NOME_COMPONENTE = 'TelaClienteConfirmacao';
const INSTRUCAO_INICIAL = 'Confirme seus dados.';

export default class TelaClienteConfirmacao extends Component {
	
    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);
        
        this.salvar = this.salvar.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.irParaFotoCNH = this.irParaFotoCNH.bind(this);
        this.registrarEventoFoco = this.registrarEventoFoco.bind(this);
        this.definirDadosPadraoTela = this.definirDadosPadraoTela.bind(this);
        this.avancar = this.avancar.bind(this);
        this.voltar = this.voltar.bind(this);
    }

    componentDidMount() {
        let nomeFuncao = 'componentDidMount';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        this.registrarEventoFoco();

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    registrarEventoFoco() {
	
        this.oNavegacao.addListener('focus', this.definirDadosPadraoTela);
    }

    definirDadosPadraoTela() {
        let nomeFuncao = 'definirDadosPadraoTela';
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
    
        Orientation.unlockAllOrientations();
        this.oDadosControleApp.cadastrando_cliente = true;
        this.oDadosControleApp.cadastrando_veiculo = false;
        this.oDadosInstrucao.texto_instrucao = INSTRUCAO_INICIAL;
    
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    salvar() {
        try {
            let metodoURI = '/clientes/incluir/';

            if(!this.oDadosControleApp.novo_cliente) {
                metodoURI = '/clientes/alterar/';
            }
            let oDadosRequisicao = {
                cliente: this.oDadosCliente,
            }
            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, this.tratarDadosRetorno, true, false);
        } catch (oExcecao) {
            
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosRetorno(oDados, oEstado) {
        let nomeFuncao = 'tratarDadosRetorno';
        let mensagem = '';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        if (oEstado.mensagem && oEstado.mensagem.trim()) {
            mensagem = oEstado.mensagem;
        }
        if(!oEstado.ok) {

            this.oUtil.exibirMensagem(mensagem, true, this.voltar);
        } else {
        
            if(this.oDadosControleApp.novo_cliente) {

                mensagem += '\n\nA câmera será aberta para você capturar uma foto da sua CNH.';

                this.oUtil.exibirMensagem(mensagem, true, this.irParaFotoCNH);                    
            } else if(this.oDadosCliente.foto_cnh.url) {
                
                // Verifica se tem foto e pede confirmacao para atualizar.
                mensagem += '\n\nDeseja atualizar a foto da sua CNH?';
                
                this.oUtil.definirBotaoMensagem('Sim', this.irParaFotoCNH);
                this.oUtil.definirBotaoMensagem('Agora Não', this.avancar);
                this.oUtil.exibirMensagem(mensagem);
                
            } else {
                this.oUtil.exibirMensagem(mensagem, true, this.irParaFotoCNH);
            }
        }
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    avancar() {
        Orientation.unlockAllOrientations();

        this.oDadosApp.foto = this.oDadosCliente.foto_cnh;
        this.oDadosFoto = this.oDadosApp.foto;

        this.oNavegacao.navigate('Veiculo Inicio');
    }
    
    irParaFotoCNH() {
        // Importante manter a rotação na horizontal para garantir correta renderização da máscara da camera.
        Orientation.lockToLandscapeLeft();

        this.oDadosApp.foto = this.oDadosCliente.foto_cnh;
        this.oDadosFoto = this.oDadosApp.foto;
        
        this.oNavegacao.navigate('Visualizacao Foto');
    }

    voltar() {
        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
    botaoConfirmar = () => <Button title="Confirmar" onPress={this.salvar} loading={this.oDadosControleApp.processando_requisicao} ></Button>;

    render() {
        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoConfirmar } ];

        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Cadastro' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}
TelaClienteConfirmacao.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props, contexto) {
        super();
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosCliente = oDadosApp.cliente;

        return (
            <View style={styles.areaDadosCliente}>
                <ScrollView>
                    <ThemeProvider theme={theme}>
                        <View>
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
            </View>
        );
    }
}