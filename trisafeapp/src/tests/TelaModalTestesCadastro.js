'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { ThemeProvider, Input, Button, Card, ButtonGroup} from 'react-native-elements';
import {
    ScrollView,
    Alert,
    View
} from 'react-native';
import Cabecalho from '../common/CabecalhoTela';
import AreaRodape from '../common/AreaRodape';
import { styles, theme } from '../common/Estilos';
import UtilTests from './UtilTests';
import { ContextoApp } from '../contexts/ContextoApp';
import { inicializarContextoComum } from '../common/Util';
import RNFetchBlob from 'rn-fetch-blob';
import Orientation from 'react-native-orientation';

const NOME_COMPONENTE = 'TelaModalTestesCadastro';
const INSTRUCAO_INICIAL = 'Selecione a opção de teste.';

export default class TelaModalTestesCadastro extends Component {

    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);

        this.objUtilTests = new UtilTests();

        this.inicializarDadosTela = this.inicializarDadosTela.bind(this);
        this.irParaTesteCadastroIter = this.irParaTesteCadastroIter.bind(this);
        this.irParaTesteBoletoGerenciaNet = this.irParaTesteBoletoGerenciaNet.bind(this); 
        this.irParaTesteContratoPDF = this.irParaTesteContratoPDF.bind(this);
        this.irParaTesteDownloadContrato = this.irParaTesteDownloadContrato.bind(this);
        this.irParaTesteDownloadBoleto = this.irParaTesteDownloadBoleto.bind(this);
        this.irParaTesteIncluirSignatario = this.irParaTesteIncluirSignatario.bind(this);
        this.irParaTesteAssinarContrato = this.irParaTesteAssinarContrato.bind(this);
        this.irParaTesteFotoCNH = this.irParaTesteFotoCNH.bind(this);
        this.irParaTesteFotoDocVeiculo = this.irParaTesteFotoDocVeiculo.bind(this);
        this.obterUltimoCliente = this.obterUltimoCliente.bind(this);        
        this.obterContratoPorCliente = this.obterContratoPorCliente.bind(this);
        this.obterURLContrato = this.obterURLContrato.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.tratarDadosRetornoContrato = this.tratarDadosRetornoContrato.bind(this);
        this.tratarObterURLContrato = this.tratarObterURLContrato.bind(this);
        this.gerarDadosTestes = this.gerarDadosTestes.bind(this);
        this.incluirSignatario = this.incluirSignatario.bind(this);
        this.voltar = this.voltar.bind(this);
    }

    componentDidMount() {
        let nomeFuncao = 'componentDidMount';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        Orientation.unlockAllOrientations();
        this.inicializarDadosTela();
        
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    inicializarDadosTela() {

        if(!this.oGerenciadorContextoApp.temDados()) {
            this.obterUltimoCliente();
        }
    }

    irParaTesteCadastroIter() {
        this.oNavegacao.navigate('Fluxo Cadastro Cliente', { screen: 'Cadastro' });

    }

    irParaTesteBoletoGerenciaNet() {
        this.oNavegacao.navigate('Fluxo Cadastro Cliente', { screen: 'Boleto' });

    }

    irParaTesteContratoPDF() {
        this.oNavegacao.navigate('Fluxo Cadastro Cliente', { screen: 'Contratacao' });
    }

    irParaTesteFotoCNH() {
        // this.oNavegacao.navigate('Fluxo Cadastro Cliente', { screen: 'Foto CNH' });
        this.oNavegacao.navigate('Visualizacao Foto CNH');
        
    }

    irParaTesteFotoDocVeiculo() {
        
        //this.oNavegacao.navigate('Foto CNH', this.state);
    }

    obterUltimoCliente() {
        try {
            let metodoURI = '/clientes/obter_ultimo/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarDadosRetorno);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosRetorno(oDados, oEstado) {
        this.oGerenciadorContextoApp.atribuirDados('cliente', oDados, this);
        
        this.obterContratoPorCliente();
    }

    obterContratoPorCliente() {

        try {
            let metodoURI = '/contratos/obter_por_cliente/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarDadosRetornoContrato);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }
    
    tratarDadosRetornoContrato(oDados) {
        this.oGerenciadorContextoApp.atribuirDados('contrato', oDados, this);
        this.oConfiguracao.solicitarPermissaoNumeroTelefone();
    }

    gerarDadosTestes() {
        let oDadosCliente = this.oDadosApp.cliente;

        let numAleatorio = Math.random();
        let usuario = numAleatorio.toString(36).slice(6);

        oDadosCliente.nome = 'Fernando Reck ' + usuario;
        oDadosCliente.cpf = this.objUtilTests.gerarCPF();
        oDadosCliente.email = usuario + '@emailtestes.com.br';
        oDadosCliente.nome_usuario = usuario;
        oDadosCliente.telefone = '519' + numAleatorio.toString().slice(10);
        oDadosCliente.rua = 'Rua do Relógio';
        oDadosCliente.numero = numAleatorio.toString().slice(15);
        oDadosCliente.cidade = 'Porto Alegre';
        oDadosCliente.uf = 'RS';
        oDadosCliente.complemento = 'Ap. 4' + numAleatorio.toString(16);
        oDadosCliente.bairro = 'Bela Vista';
        oDadosCliente.cep = numAleatorio.toString().slice(10);

        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    irParaTesteDownloadContrato() {
        this.oConfiguracao.solicitarPermissaoArmazenamento(this.obterURLContrato);
    }

    obterURLContrato() {

        try {
            let metodoURI = '/contratos/obter_url_contrato_docx/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarObterURLContrato);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarObterURLContrato(oDados, oEstado) {
        
        if(oEstado.ok && oDados) {
            RNFetchBlob
            .config({
                fileCache : true,
                appendExt: 'docx',
            })
            .fetch('GET', oDados)
            .then((res) => {
                // the temp file path
                console.log('The file saved to ', res.path());
                console.log('Caminho downloads:', RNFetchBlob.fs.dirs.DownloadDir);

                let nomeArquivo = `Contrato_Trisafe_${this.oDadosApp.contrato.id_contrato}.docx`;
                let caminhoArquivoDestino = `${RNFetchBlob.fs.dirs.DownloadDir}/${nomeArquivo}`;
                
                RNFetchBlob.android.actionViewIntent(res.path(), 'application/msword')
                .then((valor) => {
                    console.log(valor);
                }).catch((e) => {
                    this.oUtil.tratarExcecao(e);    
                });

                RNFetchBlob.fs.cp(res.path(), caminhoArquivoDestino).then((resultado) => {
                    console.log('Arquivo movido: ', resultado);
                    Alert.alert('TriSafe', `Seu contrato salvo. Verifique na pasta Downloads o arquivo ${nomeArquivo}.`);
                }).catch((oExcecao) => {
                    this.oUtil.tratarExcecao(oExcecao);
                });
            }).catch((e) =>{
                this.oUtil.tratarExcecao(e);
            })
        }
    }

    irParaTesteIncluirSignatario() {
        this.incluirSignatario();
    }

    incluirSignatario() {
        try {
            let metodoURI = '/contratos/incluir_signatario_contrato/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarIncluirSignatario);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarIncluirSignatario(oDados, oEstado) {
        
    }

    irParaTesteAssinarContrato() {

    }

    irParaTesteDownloadBoleto(){

    }

    voltar() {
        this.oNavegacao.goBack();
    }
    
    botaoCadastro = () => <Button title="Testar Cadastro" onPress={this.irParaTesteCadastroIter} ></Button>
    botaoGerarDados = () => <Button title="Gerar Dados Teste" onPress={this.gerarDadosTestes} ></Button>
    botaoContrato = () => <Button title="Testar Contrato" onPress={this.irParaTesteContratoPDF} ></Button>
    botaoBoleto = () => <Button title="Testar Boleto" onPress={this.irParaTesteBoletoGerenciaNet} ></Button>
    botaoDownloadContrato = () => <Button title="Download Contrato" onPress={this.irParaTesteDownloadContrato} ></Button>
    botaoDownloadBoleto = () => <Button title="Download Boleto" onPress={this.irParaTesteDownloadBoleto} ></Button>
    botaoIncluirSignatario = () => <Button title="Testar Incluir Signatario" onPress={this.irParaTesteIncluirSignatario} ></Button>
    botaoAssinarContrato = () => <Button title="Testar Assinar Contrato" onPress={this.irParaTesteAssinarContrato} ></Button>
    botaoFotoCNH = () => <Button title="Testar Foto CNH" onPress={this.irParaTesteFotoCNH} ></Button>
    botaoFotoDocVeiculo = () => <Button title="Testar Foto Doc" onPress={this.irParaTesteFotoDocVeiculo} ></Button>
    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;
    
    render() {
        let botoesTestes1 = [ 
            { element: this.botaoCadastro }, { element: this.botaoGerarDados } 
        ];
        let botoesTestes2 = [ 
            { element: this.botaoContrato }, { element: this.botaoBoleto } 
        ];
        let botoesTestes3 = [ 
            { element: this.botaoDownloadContrato }, { element: this.botaoDownloadBoleto } 
        ];
        let botoesTestes4 = [ 
            { element: this.botaoIncluirSignatario }, { element: this.botaoAssinarContrato } 
        ];
        let botoesTestes5 = [ 
            { element: this.botaoFotoCNH }, { element: this.botaoFotoDocVeiculo } 
        ];
        let botoesTela = [ 
            { element: this.botaoVoltar }, 
        ];

        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Testes Cadastro' nomeTela='Início' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp} 
                    botoesTestes1={botoesTestes1} 
                    botoesTestes2={botoesTestes2} 
                    botoesTestes3={botoesTestes3}
                    botoesTestes4={botoesTestes4}
                    botoesTestes5={botoesTestes5}
                />
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}

export class AreaDados extends Component {

    constructor(props, contexto) {
        super();

        this.atualizarDados = this.atualizarDados.bind(this);
    }

    atualizarDados(oDadosCliente) {
        let oDadosNavegacao = this.props.dados_app;
        oDadosNavegacao.cliente = oDadosCliente;
        
        this.setState(oDadosNavegacao);
    }

    render() {
        let oDadosCliente = this.props.dadosApp.cliente;

        return (
            <View style={styles.areaDadosCliente}>
                <ButtonGroup
                    buttons={this.props.botoesTestes1}
                    buttonStyle={ {alignItems: 'stretch'} }
                />
                <ButtonGroup
                    buttons={this.props.botoesTestes2}
                    buttonStyle={ {alignItems: 'stretch'} }
                />
                <ButtonGroup
                    buttons={this.props.botoesTestes3}
                    buttonStyle={ {alignItems: 'stretch'} }
                />
                <ButtonGroup
                    buttons={this.props.botoesTestes4}
                    buttonStyle={ {alignItems: 'stretch'} }
                />
                <ButtonGroup
                    buttons={this.props.botoesTestes5}
                    buttonStyle={ {alignItems: 'stretch'} }
                />
                <ScrollView>
                    <ThemeProvider theme={theme}>                    
                        <View>
                            <Card title='Últimos dados de teste'>
                                <View style={{flex: 1, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' }}>
                                    <Input label="Nome Completo" style={styles.Input} value={oDadosCliente.nome} onChangeText={(valor) => { oDadosCliente.nome = valor; this.atualizarDados(oDadosCliente) }}></Input>                
                                    <Input label="E-mail" style={styles.Input} value={oDadosCliente.email} onChangeText={(valor) => { oDadosCliente.email = valor; this.atualizarDados(oDadosCliente) }}></Input>
                                    <Input label="CPF" style={styles.Input} value={oDadosCliente.cpf} onChangeText={(valor) => { oDadosCliente.cpf = valor; this.atualizarDados(oDadosCliente) }}></Input>
                                </View>
                            </Card>
                        </View>
                    </ThemeProvider>
                </ScrollView>
            </View>
        );
    }
}
TelaModalTestesCadastro.contextType = ContextoApp;