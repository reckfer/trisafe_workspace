/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import {
    StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
    areaCliente: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#f5f5f5',
    },
    areaCabecalho: {
        flex: .14,
        backgroundColor: '#f5f5f5',
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    subAreaTitulo: {
        width:125,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "stretch",
    },
    areaDadosCliente: {
        flex: .75,
        padding: 10,
        borderRadius: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 1,
    },
    areaRodape: {
        flex: .11,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    subAreaBarraEstado: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "stretch",
    },
    textoTitulo: {
        fontSize: 20,
        fontWeight: '200',
        color: '#000000',
        textAlign: 'center',
        
    },
    textoNomeTela: {
        fontSize: 16,
        fontWeight: '300',
        color: '#000000',
        textAlign: 'center',
        marginTop: 10,
    },
});

const theme = {
    Input: {
        containerStyle: {
            margin: 5,
            backgroundColor: '#fffafa',
            borderRadius: 7,
            alignSelf: 'center',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 2,
        },
        inputContainerStyle: {
            borderWidth: 0,
            borderColor: 'white',
          },
      },
    Card: {
        borderRadius: 7,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    Button: {
        buttonStyle: {
            width: 10,
        },
    }
  };

export { styles, theme }