'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Alert,
    View,
    Text
} from 'react-native';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import { Button, Card, Divider } from 'react-native-elements';
import Cabecalho from '../common/CabecalhoTela';
import { styles } from '../common/Estilos';
import AreaRodape from '../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import Util from '../common/Util';
import Orientation from 'react-native-orientation';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Configuracao from '../common/Configuracao';
import RNFetchBlob from 'rn-fetch-blob';
import { StackActions } from '@react-navigation/native';

export default class TelaModalContratoClicksign extends Component {
	
    constructor(props, value) {
        super(props);
        
        Orientation.unlockAllOrientations();

        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaModalContratoClicksign.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosContrato = this.oDadosApp.contrato;
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp, this);
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oDadosControleApp.processando_requisicao = false;
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.incluirContrato = this.incluirContrato.bind(this);
        this.tratarIncluirContrato = this.tratarIncluirContrato.bind(this);
        this.contratado = this.contratado.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.voltar = this.voltar.bind(this);

        this.texto_instrucao = 'Contrato de serviço de rastreamento.'
        this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;
        this.oRegistradorLog.registrar('TelaModalContratoClicksign.constructor() => Finalizou.');
    }
    
    componentDidMount() {        

        if(this.oGerenciadorContextoApp.temDados()) {
            
            if(!this.oDadosContrato.url_doc) {
                this.incluirContrato();
            }
        }
    }

    incluirContrato() {
        try {
            let metodoURI = '/contratos/incluir_com_signatario/';

            let oDadosParametros = JSON.stringify(this.state);
            
            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarIncluirContrato);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarIncluirContrato(oDados, oEstado) {
        
        if(oEstado.ok) {
            this.oGerenciadorContextoApp.atribuirDados('contrato', oDados);
            this.oGerenciadorContextoApp.atribuirDados('cliente', oDados.cliente);
            this.oGerenciadorContextoApp.atribuirDados('boleto', oDados.boleto);
            
            let oCliente = this.oDadosApp.cliente;
            
            if(!this.oDadosContrato.aceito && oCliente && oCliente.id_signatario_contrato && oCliente.id_signatario_contrato.indexOf('|-|') > 0) {
                let partesSignatario = oCliente.id_signatario_contrato.split('|-|');
                
                if(partesSignatario && partesSignatario.length > 1) {

                    this.oDadosContrato.url_doc = `https://sandbox.clicksign.com/sign/${partesSignatario[1]}`;
                }

                this.oRegistradorLog.registrar('tratarIncluirContrato() URL do contrato: ', this.oDadosContrato.url_doc);

                if(this.oDadosContrato.url_doc) {
                    
                    const pop = StackActions.pop(1);
                
                    console.log('Removendo tela atual...', JSON.stringify(pop));
                    this.oNavegacao.dispatch(pop);

                    this.oNavegacao.navigate('Fluxo Modais', { screen: 'Contrato Clicksign' });
                } else {

                    this.oRegistradorLog.registrar('tratarIncluirContrato() Não foi possível obter o link do contrato.');

                    Alert.alert('TriSafe', 'Não foi possível obter o link do contrato. Enviamos uma cópia por e-mail. Por favor, verifique seu e-mail');
                }
            }
        }
    }

    contratado() {
        try {
            let metodoURI = '/contratos/aceitar/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarDadosRetorno);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosRetorno(oDados, oEstado) {
        this.oGerenciadorContextoApp.atribuirDados('contrato', oDados);
        this.oGerenciadorContextoApp.atribuirDados('boleto', oDados);

        if(oEstado.ok) {
            this.oNavegacao.navigate('Boleto', this.state);
        }
    }

    voltar() {

        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
    botaoPronto = () => <Button title="Pronto" onPress={this.contratado} loading={this.oDadosControleApp.processando_requisicao}></Button>;

    render() {

        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoPronto } ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Contrataçâo' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp} navigation={this.oNavegacao}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}
TelaModalContratoClicksign.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props, value) {
        super(props);
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaModalContratoClicksign.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this);
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }

        this.montarIcone = this.montarIcone.bind(this);
        this.baixarContrato = this.baixarContrato.bind(this);
        this.baixarBoleto = this.baixarBoleto.bind(this);
    }

    montarIcone(nomeIcone, descricao, oFuncaoOnPress, oFuncaoOnLongPress, habilitado) {
        let corIcone = '#009999';

        if(!habilitado) {
            corIcone = '#e0ebeb';
        }
        if(descricao) {
            return (
                <TouchableOpacity onPress={oFuncaoOnPress} >
                    <View style={{flexDirection:'column', width:65, marginRight:10, marginLeft:10, alignItems:'center', justifyContent:'center'}}>
                        <Icon name={nomeIcone} size={30} color={corIcone} />
                        <Text style={{color:corIcone}}>{descricao}</Text>
                    </View>
                </TouchableOpacity>
            )
        } else {
            return(
                <TouchableOpacity onPress={oFuncaoOnPress} onLongPress={oFuncaoOnLongPress}>
                    <View style={{flexDirection:'column', width:50, alignItems:'center', justifyContent:'center'}}>
                        <Icon name={nomeIcone} size={25} color={corIcone} />
                    </View>
                </TouchableOpacity>
            )
        }
    }

    baixarContrato() {
        
        let nome_prefixo = 'Contrato_Trisafe';
        let tipoArquivo = 'docx';
        let tipoMidia  = 'application/msword';
        let url = this.oDadosApp.contrato.url_doc;

        if(this.oDadosApp.contrato.url_pdf) {
            nome_prefixo = 'Contrato_Trisafe_Assinado';
            tipoArquivo = 'pdf';
            tipoMidia  = 'application/pdf';
            url = this.oDadosApp.contrato.url_pdf;
        }

        RNFetchBlob
        .config({
            fileCache : true,
            appendExt: tipoArquivo,
        })
        .fetch('GET', url)
        .then((res) => {
            let caminhoLocal = res.path();
            // the temp file path
            console.log('The file saved to ', caminhoLocal);
            console.log('Caminho downloads:', RNFetchBlob.fs.dirs.DownloadDir);
            
            let nomeArquivo = `${nome_prefixo}_${this.oDadosApp.contrato.id_contrato}.${tipoArquivo}`;
            let caminhoArquivoDestino = `${RNFetchBlob.fs.dirs.DownloadDir}/${nomeArquivo}`;
            
            RNFetchBlob.android.actionViewIntent(caminhoLocal, tipoMidia)
            .then((valor) => {
                console.log(valor);
            }).catch((e) => {
                this.oUtil.tratarExcecao(e);    
            });

            RNFetchBlob.fs.cp(caminhoLocal, caminhoArquivoDestino).then((resultado) => {
                console.log('Arquivo movido: ', resultado);
                Alert.alert('TriSafe', `Seu contrato salvo. Verifique na pasta Downloads o arquivo ${nomeArquivo}.`);
            });
        }).catch((e) =>{
            this.oUtil.tratarExcecao(e);
        })
    };

    baixarBoleto() {
        
        let nome_prefixo = 'Boleto_Trisafe';
        let tipoArquivo = 'pdf';
        let tipoMidia  = 'application/pdf';
        let url = this.oDadosApp.boleto.url_pdf;

        RNFetchBlob
        .config({
            fileCache : true,
            appendExt: tipoArquivo,
        })
        .fetch('GET', url)
        .then((res) => {
            let caminhoLocal = res.path();
            // the temp file path
            console.log('Caminho arquivo local: ', caminhoLocal);
            console.log('Caminho downloads:', RNFetchBlob.fs.dirs.DownloadDir);
            
            let nomeArquivo = `${nome_prefixo}_${this.oDadosApp.contrato.id_contrato}.${tipoArquivo}`;
            let caminhoArquivoDestino = `${RNFetchBlob.fs.dirs.DownloadDir}/${nomeArquivo}`;
            
            RNFetchBlob.android.actionViewIntent(caminhoLocal, tipoMidia)
            .then((valor) => {
                console.log(valor);
            }).catch((e) => {
                this.oUtil.tratarExcecao(e);    
            });

            RNFetchBlob.fs.cp(caminhoLocal, caminhoArquivoDestino).then((resultado) => {
                console.log('Arquivo movido: ', resultado);
                Alert.alert('TriSafe', `Seu contrato salvo. Verifique na pasta Downloads o arquivo ${nomeArquivo}.`);
            });
        }).catch((e) =>{
            this.oUtil.tratarExcecao(e);
        })
    };

    render() {
        let oDadosApp = this.props.dadosApp;
        let oNavegacao = this.props.navigation;
        let oDadosContrato = oDadosApp.contrato;
        let areaContrato = (
            <View>
                <Text>Buscando contrato. Aguarde...</Text>
            </View>);

        
        console.log('oDadosContrato.url_doc... ', oDadosContrato.url_doc);
        
        if(oDadosContrato.aceito) {

            areaContrato = <View style={{flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                <Text>Obrigado por contratar a TriSafe...</Text>
                <Card key={1} 
                    title='Contrato'
                    containerStyle={{backgroundColor: '#f0f5f5', borderWidth: 0, borderRadius:5, flexDirection:'column', width:'90%'}} 
                >
                    <View  style={{flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'space-evenly' }}>
                        {this.montarIcone('download', 'Baixar', () => {this.oConfiguracao.solicitarPermissaoArmazenamento(this.baixarContrato);}, () => {}, true)}
                        {this.montarIcone('file-o', 'Visualizar', () => {oNavegacao.navigate('Fluxo Modais', { screen: 'Contrato Clicksign' });}, () => {}, true)}
                    </View>
                </Card>
                <Card key={2} 
                    title='Boleto'
                    containerStyle={{backgroundColor: '#f0f5f5', borderWidth: 0, borderRadius:5, flexDirection:'column', width:'90%'}} 
                >
                    <View  style={{flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'space-evenly' }}>
                        {this.montarIcone('download', 'Baixar', () => {this.oConfiguracao.solicitarPermissaoArmazenamento(this.baixarBoleto);}, () => {}, true)}
                        {this.montarIcone('file-o', 'Visualizar', () => {oNavegacao.navigate('Fluxo Modais', { screen: 'Boleto Gerencianet' });}, () => {}, true)}
                    </View>
                </Card>
            </View>
            // botaoCadastro = () => <Button title="Testar Cadastro" onPress={this.irParaTesteCadastroIter} ></Button>
            // botaoGerarDados = () => <Button title="Gerar Dados Teste" onPress={this.gerarDadosTestes} ></Button>
            // botaoContrato = () => <Button title="Testar Contrato" onPress={this.irParaTesteContratoPDF} ></Button>
            // botaoBoleto = () => <Button title="Testar Boleto" onPress={this.irParaTesteBoletoGerenciaNet} ></Button>
            // botaoDownloadContrato = () => <Button title="Download Contrato" onPress={this.irParaTesteDownloadContrato} ></Button>
            // botaoDownloadBoleto = () => <Button title="Download Boleto" onPress={this.irParaTesteDownloadBoleto} ></Button>
            // botaoIncluirSignatario = () => <Button title="Testar Incluir Signatario" onPress={this.irParaTesteIncluirSignatario} ></Button>
            // botaoAssinarContrato = () => <Button title="Testar Assinar Contrato" onPress={this.irParaTesteAssinarContrato} ></Button>
            // botaoFotoCNH = () => <Button title="Testar Foto CNH" onPress={this.irParaTesteFotoCNH} ></Button>
            // botaoFotoDocVeiculo = () => <Button title="Testar Foto Doc" onPress={this.irParaTesteFotoDocVeiculo} ></Button>
            // botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;

            // let botoesTestes1 = [ 
            //     { element: this.botaoCadastro }, { element: this.botaoGerarDados } 
            // ];
            // let botoesTestes2 = [ 
            //     { element: this.botaoContrato }, { element: this.botaoBoleto } 
            // ];
            // let botoesTestes3 = [ 
            //     { element: this.botaoDownloadContrato }, { element: this.botaoDownloadBoleto } 
            // ];
            // let botoesTestes4 = [ 
            //     { element: this.botaoIncluirSignatario }, { element: this.botaoAssinarContrato } 
            // ];
            // let botoesTestes5 = [ 
            //     { element: this.botaoFotoCNH }, { element: this.botaoFotoDocVeiculo } 
            // ];
            // let botoesTela = [ 
            //     { element: this.botaoVoltar }, 
            // ];
            
            // let areaContrato = (
            //     <View style={styles.areaCliente}>
            //     <Cabecalho titulo='Testes Cadastro' nomeTela='Início' navigation={this.oNavegacao} />
            //     <AreaDados dadosApp={this.oDadosApp} 
            //         botoesTestes1={botoesTestes1} 
            //         botoesTestes2={botoesTestes2} 
            //         botoesTestes3={botoesTestes3}
            //         botoesTestes4={botoesTestes4}
            //         botoesTestes5={botoesTestes5}
            //     />
            //     <AreaRodape botoes={botoesTela} mensagem={''}/>
            // </View>)


            
    }
    
    return (
        <View style={styles.areaDadosCliente}>
            {areaContrato}
        </View>
    );}
}
AreaDados.contextType = ContextoApp;