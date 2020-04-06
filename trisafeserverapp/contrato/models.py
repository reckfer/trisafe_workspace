import json
import sys
import traceback
from django.db import models
from rest_framework import status
from comum.retorno import Retorno
from cliente.models import Cliente
from produto.models import Produto
from boleto.models import BoletoGerenciaNet
from boleto.models import TransacaoGerenciaNet
from fpdf import FPDF

class Contrato(models.Model):
    id_contrato = models.CharField(primary_key=True, max_length=16)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, blank=False, null=False)
    produtos_contratados = models.ManyToManyField(Produto)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    charge_id = models.CharField(max_length=10, blank=False, null=True)
    dt_hr_inclusao = models.DateTimeField(blank=False, null=False, auto_now_add=True)
    ult_atualizacao = models.DateTimeField(blank=False, null=False, auto_now=True)
    aceito = models.BooleanField(default=False)

    # Tipos de produtos
    FISICO = 'F'
    SERVICO = 'S'
    TIPOS_PRODUTO = [
        (FISICO, 'Contrato Físico'),
        (SERVICO, 'Serviço'),
    ]
    
    def incluir(self, chaves_produtos):
        try:

            retorno_cliente = self.cliente.obter()

            if not retorno_cliente.estado.ok:
                return retorno_cliente

            m_produto = Produto()
            retorno_produtos = m_produto.listar_especificos(chaves_produtos)
            
            if not retorno_produtos.estado.ok:
                return retorno_produtos

            d_dados_pedido = self.gerar_dados_pedido_transacao_gerencia_net(retorno_produtos.dados)

            m_transacao_gerencia_net = TransacaoGerenciaNet()

            retorno_transacao = m_transacao_gerencia_net.incluir(d_dados_pedido)

            if not retorno_transacao.estado.ok:
                return retorno_transacao
            
            self.charge_id = m_transacao_gerencia_net.id            
            self.id_contrato = str(self.cliente.id_cliente_iter).rjust(6, '0') + str(self.charge_id).rjust(10, '0')
            self.cliente = retorno_cliente.dados
            self.calcular_valor_total(retorno_produtos.dados)

            # Inclui na base
            self.save()

            # Atualiza com os produtos
            self.produtos_contratados.add(*retorno_produtos.dados)

            retorno = Retorno(True, 'Seu contrato foi gerado e será efetivado após o pagamento do boleto.')
            retorno.dados = self

            return retorno
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
            return retorno

    def aceitar(self):
        try:

            # m_contratos = Contrato.objects.filter(id_contrato=self.id_contrato)
            
            # if m_contratos:
            #     m_contrato = m_contratos[0]
            #     if m_contrato:
            #         m_contrato.aceito = True
            #         m_contrato.save()

            #         retorno = Retorno(True)
            #         retorno.dados = m_contrato

            retorno = self.obter()

            if not retorno.estado.ok:
                return retorno
            
            m_contrato = retorno.dados
            m_contrato.aceito = True
            m_contrato.save()

            return retorno
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
            return retorno
    
    def obter(self):
        try:
            retorno = Retorno(False, 'Contrato não localizado.')
            m_contratos = Contrato.objects.filter(id_contrato=self.id_contrato)
            
            if m_contratos:
                m_contrato = m_contratos[0]
                if m_contrato:
                    m_contrato.aceito = True
                    m_contrato.save()

                    retorno = Retorno(True)
                    retorno.dados = m_contrato

            return retorno
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
            return retorno

    def calcular_valor_total(self, m_produtos):
        
        self.valor_total = 0.0

        for m_produto in m_produtos:
            self.valor_total = float(self.valor_total) + float(m_produto.valor)
    
    def gerar_dados_pedido_transacao_gerencia_net(self, m_produtos):
        produtos = []
        
        # self.valor_total = 0.0

        for m_produto in m_produtos:
            # self.valor_total = float(self.valor_total) + float(m_produto.valor)
            
            item = {
                'name': m_produto.nome,
                'value': int(float(m_produto.valor) * 100),
                'amount': 1
            }
            produtos.append(item)

        # frete = {
        #     'name': "Contrato de adesao",
        #     'value': float(self.valor_total) * 100
        # }

        d_dados_pedido = {
            'items': produtos,
            # 'shippings': frete
        }

        return d_dados_pedido
        
    def gerarContratoPDF(self):
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="Welcome to Py", ln=1, align="C")
        pdf.output("simple_demo.pdf")
    
    def json(self):
        return self.__criar_json__()

    def __criar_json__(self):
        
        ret = {
            'id_contrato': self.id_contrato,
            'cliente': self.cliente.json(),
            'produtos_contratados': self.produtos_contratados.values(),
            'valor_total': self.valor_total,
            'charge_id' : self.charge_id,
            'dt_hr_inclusao' : self.dt_hr_inclusao,
            'ult_atualizacao' : self.ult_atualizacao,
        }
        return ret

    def __str__(self):
        return self.cliente.nome