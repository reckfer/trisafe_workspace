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
    View,
} from 'react-native';
import { ThemeProvider, Input, Button } from 'react-native-elements';
import Cabecalho from '../common/CabecalhoTela';
import { styles, theme } from '../common/Estilos';
import AreaRodape from '../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import Orientation from 'react-native-orientation';
import { inicializarContextoComum } from '../common/Configuracao';
import { clonarObjeto, DADOS_VEICULO } from '../contexts/DadosAppGeral';

const NOME_COMPONENTE = 'TelaVeiculoCadastro';
const INSTRUCAO_INICIAL = 'Informe os dados do seu veículo.';

export default class TelaVeiculoCadastro extends Component {
	
    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);
        
        this.obter = this.obter.bind(this);
        this.tratarDadosVeiculo = this.tratarDadosVeiculo.bind(this);
        this.salvar = this.salvar.bind(this);
        this.tratarRetornoAtualizacao = this.tratarRetornoAtualizacao.bind(this);
        this.registrarEventoFoco = this.registrarEventoFoco.bind(this);
        this.definirDadosPadraoTela = this.definirDadosPadraoTela.bind(this);
        this.voltar = this.voltar.bind(this);
        this.irParaFotoDoc = this.irParaFotoDoc.bind(this);
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
    
        if(!this.oDadosControleApp.manter_tela_na_horizontal) {
            
            Orientation.unlockAllOrientations();        
            this.oDadosControleApp.cadastrando_veiculo = true;
            this.oDadosControleApp.cadastrando_cliente = false;
            this.oDadosInstrucao.texto_instrucao = INSTRUCAO_INICIAL;
            
            if(!this.oDadosControleApp.novo_veiculo && !this.oDadosVeiculoAtual.placa) {
                this.obter();
            }
        }
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    obter() {
        let nomeFuncao = 'obter';
        try {        
            this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

            let metodoURI = '/veiculos/obter/';
            let oDadosRequisicao = {
                veiculo: this.oDadosVeiculoAtual,
            }
            oDadosRequisicao.veiculo.cliente = this.oDadosCliente;

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, this.tratarDadosVeiculo);
            
            this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosVeiculo(oDados, oEstado) {
        let nomeFuncao = 'tratarDadosVeiculo';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        if(oEstado.ok) {
            this.oGerenciadorContextoApp.atribuirDados('veiculo_atual', oDados, this);
        }
        
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    salvar() {
        let nomeFuncao = 'salvar';
        try {        
            this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

            let metodoURI = '/veiculos/alterar/';
            
            if(this.oDadosControleApp.novo_veiculo) {
                metodoURI = '/veiculos/incluir/';
            }
            let oDadosRequisicao = {
                veiculo: this.oDadosVeiculoAtual,
            }
            oDadosRequisicao.veiculo.cliente = this.oDadosCliente;

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, this.tratarRetornoAtualizacao, true);

            this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarRetornoAtualizacao(oDados, oEstado) {
        let nomeFuncao = 'tratarRetornoAtualizacao';
        let mensagem = '';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        if (oEstado.mensagem && oEstado.mensagem.trim()) {
            mensagem = oEstado.mensagem;
        }
        if(!oEstado.ok) {

            this.oUtil.exibirMensagem(mensagem, true, this.voltar);
        } else {
        
            if(this.oDadosControleApp.novo_veiculo) {

                // if(this.oDadosVeiculos.length == 0 || 
                //     (this.oDadosVeiculos.length == 1 && !this.oDadosVeiculos.placa)) {
                    
                //     // Adiciona o veiculo novo na lista, se eh o primeiro veiculo.
                //     this.oGerenciadorContextoApp.atribuirDados('veiculos', [oDados], this);
                // } else {

                //     // Adiciona o veiculo novo na lista.
                //     this.oDadosVeiculos.push(this.oDadosVeiculoAtual);
                // }

                mensagem += '\n\nA câmera será aberta para tirar uma foto do documento do veículo.';

                this.oUtil.exibirMensagem(mensagem, true, this.irParaFotoDoc);                    
            } else if(this.oDadosVeiculoAtual.foto_doc.url) {
                
                // Verifica se tem foto e pede confirmacao para atualizar.
                mensagem += '\n\nDeseja atualizar a foto do documento do veículo?';
                
                this.oUtil.definirBotaoMensagem('Sim', this.irParaFotoDoc);
                // Volta para a tela de lista.
                this.oUtil.definirBotaoMensagem('Agora Não', this.voltar);
                this.oUtil.exibirMensagem(mensagem);
                
            } else {
                this.oUtil.exibirMensagem(mensagem, true, this.irParaFotoDoc);
            }
        }

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    irParaFotoDoc() {
        // Importante manter a rotação na horizontal para garantir correta renderização da máscara da camera.
        //Orientation.lockToLandscapeLeft();

        this.oDadosApp.foto = this.oDadosVeiculoAtual.foto_doc;
        this.oDadosFoto = this.oDadosApp.foto;

        this.oNavegacao.navigate('Visualizacao Foto');
    }

    voltar() {
        // Limpa os dados nas referencias de veiculo atual.
        this.oDadosApp.veiculo = clonarObjeto(DADOS_VEICULO);
        this.oDadosVeiculoAtual = this.oDadosApp.veiculo;
        
        this.oNavegacao.goBack();
    }

    render() {
        let botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>
        let botaoAvancar = () => <Button title="Confirmar" onPress={this.salvar} ></Button>
        
        let botoesTela = [ { element: botaoVoltar }, { element: botaoAvancar } ];

        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Cadastro Veículo' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}

export class AreaDados extends Component {

    constructor(props, contexto) {
        super();

        inicializarContextoComum(props, contexto, this);
    }

    render() {
        let oDadosVeiculo = this.oDadosVeiculoAtual;

        return (
            <View style={styles.areaDadosCliente}>
                <ScrollView>
                    <ThemeProvider theme={theme}>
                        <View>
                            <Input placeholder="Informe sua Placa" label="Placa" value={oDadosVeiculo.placa} onChangeText={(valor) => { oDadosVeiculo.placa = valor; this.setState(this.oDadosApp)}}></Input>
                            <Input placeholder="Informe o modelo do Veículo" label="Modelo" value={oDadosVeiculo.modelo} onChangeText={(valor) => { oDadosVeiculo.modelo = valor; this.setState(this.oDadosApp)}}></Input>
                            <Input placeholder="Informe a marca do Veículo" label="Marca" value={oDadosVeiculo.marca} onChangeText={(valor) => { oDadosVeiculo.marca = valor; this.setState(this.oDadosApp)}}></Input>
                            <Input placeholder="Informe o ano do Veículo" label="Ano" value={oDadosVeiculo.ano} onChangeText={(valor) => { oDadosVeiculo.ano = valor; this.setState(this.oDadosApp)}}></Input>
                            <Input placeholder="Informe o apelido do Veículo" label="Apelido" value={oDadosVeiculo.apelido} onChangeText={(valor) => { oDadosVeiculo.apelido = valor; this.setState(this.oDadosApp)}}></Input>
                        </View>
                    </ThemeProvider>
                </ScrollView>
            </View>
        );
    }
}

TelaVeiculoCadastro.contextType = ContextoApp;
AreaDados.contextType = ContextoApp;