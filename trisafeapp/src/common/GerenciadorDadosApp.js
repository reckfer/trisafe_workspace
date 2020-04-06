const fragmentoClienteInicio = { 
    'cliente': {
        'cpf': '', 
        'email': '', 
    }
}
const fragmentoClienteDadosPessoais = { 
    'cliente': {
        'nome': '', 
        'cpf': '', 
        'email': '', 
        'nome_usuario': '',
        'telefone': '',
    }
}

const fragmentoClienteEndereco = { 
    'cliente': {
        'cidade': '',
        'rua': '',
        'numero': '',
        'complemento': '',
        'bairro': '',
        'cep': '',
        'uf': '',
    }
}

const fragmentoProduto = { 
    'produto': {
        'codigo': '',
        'nome': '',
        'valor': '',
        'tipo': '',
    }
}

const fragmentoContrato = { 
    'contrato': {
        'id_contrato': '',
        'cliente': {},
        'produtos_contratados': [
            fragmentoProduto,
        ],
        'valor_total': 0.0,
        'charge_id' : '',
        'dt_hr_inclusao' : '',
        'ult_atualizacao' : '',
    }
}

const fragmentoControleApp = { 
    'controle_app': {
        'processando_requisicao': false,
    }
}

const composicaoDadosCliente = [
    fragmentoClienteInicio,
    fragmentoClienteDadosPessoais,
    fragmentoClienteEndereco,
]

const composicaoDadosApp = { 
    'dados_app' : [
        composicaoDadosCliente,
        fragmentoContrato,
        fragmentoControleApp,
    ]
}

export default class GerenciadorDadosApp {
    oDadosReferencia;
    oTelaReferencia;
    oNavegadorReferencia;

    constructor(oTela) {
        this.oTelaReferencia = oTela;
        this.oNavegador = oTela.props.navigation;

        this.inicializarDados(oTela);
    }

    getDadosApp() {
        if(this.oDadosReferencia) {
            return this.oDadosReferencia.dados_app;
        }
        return null;
    }

    getDadosControleApp() {
        if(this.oDadosReferencia) {
            return this.oDadosReferencia.dados_app.controle_app;
        }
        return null;
    }

    getDadosAppGeral() {
        return this.oDadosReferencia;
    }

    setDadosAppGeral(oDadosAppGeral) {
        this.oDadosReferencia = oDadosAppGeral;
    }

    irPara(nomeItemTela, oDados) {
        this.oNavegador.navigate(nomeItemTela, oDados);
    }

    voltar() {
        this.oNavegador.goBack();
    }
    /*** FUNCOES MONTAGEM OBJETO INICIAL ****/

    inicializarDados() {

        if(this.oNavegador) {
            let oDadosApp;

            if(this.oNavegador.getParam) {
                oDadosApp = this.oNavegador.getParam('dados_app');
            } else if (this.oTelaReferencia.props.route) {
                oDadosApp = this.oTelaReferencia.props.route.params;
            }
            if(oDadosApp) {
                this.oDadosReferencia = oDadosApp;
            } else if(!this.oDadosReferencia){
                this.oDadosReferencia = this.montarDadosApp(composicaoDadosApp);                
            }            
        }

        return this.oDadosReferencia;
    }

    montarDadosApp(oComposicaoDadosApp) {
        let oDadosApp = {};
        let oFragmentoRaiz;
        
        let chavesDadosRaiz = Object.keys(oComposicaoDadosApp);

        if(chavesDadosRaiz) {
            let oDadosFragmento = {};

            for(let i = 0; i < chavesDadosRaiz.length; i++) {
                oFragmentoRaiz = oComposicaoDadosApp[chavesDadosRaiz[i]];
                
                if(oFragmentoRaiz instanceof Array) {
                    this.montarFragmentoLista(oDadosFragmento, oFragmentoRaiz);
                } else {
                    this.montarFragmento(oDadosFragmento, oFragmentoRaiz);
                }
                
                oDadosApp[chavesDadosRaiz[i]] = oDadosFragmento;
            }
        }
        return oDadosApp;
    }

    montarFragmentoLista(oDadosFragmento, oFragmentoLista) {
        let chavesCampos;
        let chaveCampo;
        let oItemFragmento = {};
        let oFragmentoModelo;
        let oFragmento;
        let fragmentosProcessar;
        let listaReferenciada;

        for (let i = 0; i < oFragmentoLista.length; i ++) {
            oFragmento = oFragmentoLista[i];

            if(oFragmento instanceof Array) {
                // Nivela lista não nomeada.
                oFragmentoLista = this.nivelarListas(oFragmentoLista, oFragmento, i);
                // Reinicia o loop a partir da nova lista.
                i = -1;
            } else {
                chavesCampos = Object.keys(oFragmento);

                if(chavesCampos && chavesCampos.length > 0) {
                    chaveCampo = chavesCampos[0];

                    if(oFragmento[chaveCampo] instanceof Array) {
                        listaReferenciada = oFragmento[chaveCampo];
                        // Nivela lista nomeada.
                        oFragmentoLista = this.nivelarListas(oFragmentoLista, oFragmento[chaveCampo], i);
                        // Reinicia o loop a partir da nova lista.
                        i = 0;
                        oFragmento = oFragmentoLista[i];
                        oFragmentoModelo = this.clonarObjeto(oFragmento[Object.keys(oFragmento)[0]]);
                        
                        listaReferenciada.length = 0;
                        listaReferenciada.push(oFragmentoModelo);
                        oDadosFragmento[chaveCampo] = listaReferenciada;
                    } else {
                        if (!oDadosFragmento.hasOwnProperty(chaveCampo)) {
                            oDadosFragmento[chaveCampo] = {};
                        }

                        oItemFragmento = oFragmento[chaveCampo];
                        fragmentosProcessar = this.preencherFragmento(oDadosFragmento, oItemFragmento, chaveCampo);
                        this.adicionarArray(oFragmentoLista, fragmentosProcessar);
                    }
                }
            }
        }
    }

    nivelarListas(aListaMae, aListaFilha, indice) {
        let aListaNivelada = aListaFilha;

        for(let i = 0; i < aListaMae.length; i++) {
            if (i > indice) {
                aListaNivelada.push(aListaMae[i]);
            }
        }
        return aListaNivelada;
    }

    adicionarArray(aListaMae, aListaAdicionar) {
        if(aListaAdicionar.length > 0) {
            for(let i = 0; i < aListaAdicionar.length; i++) {
                aListaMae.push(aListaAdicionar[i]);
            }
        }
    }

    preencherFragmento(oObjetoPrincipalFinal, oItemFragmento, chaveCampo) {
        let oObjetoPrincipal = oObjetoPrincipalFinal[chaveCampo];
        let fragmentosProcessar = [];
        let oObjetoProcessar;
        let temCampo = false;
        let incluir = false;
        
        for (campo in oItemFragmento) {            
            incluir = false
            oObjetoPrincipal[campo] = oItemFragmento[campo];

            if(oItemFragmento[campo] instanceof Array) {                
                oObjetoProcessar = {};
                oObjetoProcessar[campo] = oItemFragmento[campo];
                fragmentosProcessar.push(oObjetoProcessar);
            } else if (oItemFragmento[campo] instanceof Object) {
                temCampo = false;
                for (campoTmp in oObjetoPrincipal[campo]) {            
                    temCampo = true;
                    break;
                }
                if(!temCampo) {
                    oObjetoPrincipal[campo] = oObjetoPrincipalFinal[campo];
                }
            }
        }
        return fragmentosProcessar;
    }

    /*** FUNCOES DE ATRIBUICOES ****/
    atualizarEstadoTela(objetoTela) {
        if(this.oDadosReferencia) {
            objetoTela.setState(this.oDadosReferencia);
        }
    }


    atribuirDados(nomeAtributo, oDadosAtribuir) {
        let oDados = this.oDadosReferencia.dados_app;
        let oArrayDados;
        let oItemArray;
        let oDadosItemModelo;
        let oDadosItem;
        let oArrayAtribuir;                        
        let campoItem;
        let campo;
        let atribuir;
        let pilhaObjetosContinuar = [];
        let oObjetoPreencher = oDados;
        

        if(nomeAtributo) {
            oObjetoPreencher = oDados[nomeAtributo];

            if(oObjetoPreencher instanceof Array) {
                let arrayEmpacotado = {};
                arrayEmpacotado[nomeAtributo] = oObjetoPreencher;
                oObjetoPreencher = arrayEmpacotado;

                arrayEmpacotado = {};
                arrayEmpacotado[nomeAtributo] = oDadosAtribuir;
                oDadosAtribuir = arrayEmpacotado;
            }
        }
        let oCampoPreencher;
        let camposPreencher = Object.keys(oObjetoPreencher);

        for (let i = 0; i < camposPreencher.length; i ++) {
            atribuir = true;
            campo = camposPreencher[i];
            oCampoPreencher = oObjetoPreencher[campo];

            if(oCampoPreencher instanceof Array) {
                if(oCampoPreencher.length > 0) {
                    oArrayDados = oObjetoPreencher[campo];
                    oItemArray = oArrayDados[0];
                    oDadosItemModelo = {};
                    oArrayAtribuir = oDadosAtribuir[campo];                        
                    campoItem = Object.keys(oItemArray)[0];                    
                    oDadosItemModelo = this.clonarObjeto(oItemArray);
                    oArrayDados.length = 0;
                    for(let i = 0; i < oArrayAtribuir.length; i++) {
                        oDadosItem = {};
                        for(campoNovo in oDadosItemModelo) {
                            oDadosItem[campoNovo] = '';
                        }
                        
                        this.atribuirDadosObjeto(oDadosItem, oArrayAtribuir[i]);
                        oArrayDados.push(oDadosItem);
                    }
                    
                }
            } else if(oCampoPreencher instanceof Object) {  
                // Empilha os dados do objeto atual                  
                pilhaObjetosContinuar.unshift({
                        'objBase': oObjetoPreencher,
                        'objAtribuir': oDadosAtribuir,
                        'camposPreencher': camposPreencher,
                        'indice' : i
                });
                oObjetoPreencher = oCampoPreencher;
                camposPreencher = Object.keys(oObjetoPreencher);
                nomeAtributo = campo;
                i = 0;
                oDadosAtribuir = oDadosAtribuir[campo];
            } else {   
                oObjetoPreencher[campo] = oDadosAtribuir[campo];
            }
            
            if((i + 1) === camposPreencher.length &&
                pilhaObjetosContinuar.length > 0) {

                let objContinuar = pilhaObjetosContinuar.shift();
                oObjetoPreencher = objContinuar.objBase;
                camposPreencher = objContinuar.camposPreencher;
                oDadosAtribuir = objContinuar.objAtribuir;
                i = objContinuar.indice;
            }
        }

        return this.oDadosReferencia;
    }

    atribuirDadosObjeto(oObjetoReceber, oDadosAtribuir) {        
        for(campo in oObjetoReceber) {
            oObjetoReceber[campo] = this.atribuir(campo, oDadosAtribuir);
        }
    }

    atribuir(nomeAtributo, oDadosAtribuir) {
        for(campo in oDadosAtribuir) {
            if(nomeAtributo === campo) {
                return oDadosAtribuir[nomeAtributo];
            }
        }
    }

    encontrarObjeto(nomeAtributo, oDadosApp) {
        for(campo in oDadosApp) {
            if(nomeAtributo === campo) {
                return oDadosApp[campo];
            }
        }
    }

    /*** FUNCOES AUXILIARES ****/
    temDados() {
        if(this.oDadosReferencia && this.oDadosReferencia.dados_app) {
            let oDadosApp = this.oDadosReferencia.dados_app;
            let campos = Object.keys(oDadosApp);
            let campo;
            let oCampo;
            let oPilhaPendencias = [];

            for(let i = 0; i < campos.length; i++) {
                campo = campos[i];
                oCampo = oDadosApp[campo];
            
                if(oCampo) {
                    if(oCampo instanceof Object) {
                        let oDadosAux = oCampo;

                        oPilhaPendencias.unshift({
                            'objPendente' : oDadosApp,
                            'camposPendentes' : campos,
                            'indice': i
                        });
                        if (oCampo instanceof Array && oCampo.length > 0) {
                            oDadosAux = oCampo[0];
                        }
                        oDadosApp = oDadosAux;
                        campos = Object.keys(oDadosAux);
                        i = 0;
                    } else if (typeof(oCampo) === 'string' && oCampo.trim()) {
                        return true;
                    } else if (typeof(oCampo) === 'number' && oCampo > 0) {
                        return true;
                    }
                }

                if((i + 1) === campos.length && oPilhaPendencias.length > 0) {

                    let objContinuar = oPilhaPendencias.shift();
                    oDadosApp = objContinuar.objPendente;
                    campos = objContinuar.camposPendentes;
                    i = objContinuar.indice;
                }
            }
        }
        return false;
    }

    clonarObjeto(objeto) {
        let novoObjeto = {};

        // Copia o modelo do objeto.
        for(campoNovo in objeto) {
            novoObjeto[campoNovo] = '';
        }
        return novoObjeto;
    }
}