import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const prisma = new PrismaClient()

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { marginBottom: 24, borderBottom: '2px solid #7c3aed', paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#7c3aed', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#666666' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8, borderBottom: '1px solid #e5e7eb', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { fontSize: 10, color: '#666666', width: 160 },
  value: { fontSize: 10, color: '#1a1a1a', flex: 1 },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#7c3aed', padding: '6 8', borderRadius: 4, marginBottom: 4 },
  tableHeaderText: { fontSize: 9, color: '#ffffff', fontWeight: 'bold', flex: 1 },
  tableRow: { flexDirection: 'row', padding: '5 8', borderBottom: '1px solid #f3f4f6' },
  tableCell: { fontSize: 9, color: '#374151', flex: 1 },
  badge: { padding: '2 6', borderRadius: 3, fontSize: 8, fontWeight: 'bold' },
  badgeConfirmado: { backgroundColor: '#fef3c7', color: '#d97706' },
  badgeFalso: { backgroundColor: '#fee2e2', color: '#dc2626' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1px solid #e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#9ca3af' },
  summaryGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: 10 },
  summaryNumber: { fontSize: 20, fontWeight: 'bold', color: '#7c3aed', marginBottom: 2 },
  summaryLabel: { fontSize: 8, color: '#6b7280', textTransform: 'uppercase' },
})

function RelatorioDocument({ relatorio }) {
  const defeitos = relatorio.defeitos || []
  const confirmados = defeitos.filter(d => d.defeito?.statusConfirmacao === 'confirmado')
  const falsos = defeitos.filter(d => d.defeito?.statusConfirmacao === 'falso_positivo')
  const totalImagens = relatorio.imagens?.length || 0

  // Agrupa por classe
  const porClasse = defeitos.reduce((acc, rd) => {
    const classe = rd.defeito?.classeDefeito || 'Sem classe'
    acc[classe] = (acc[classe] || 0) + 1
    return acc
  }, {})

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>InspectAI — Relatório de Inspeção</Text>
          <Text style={styles.subtitle}>Gerado em {new Date().toLocaleString('pt-BR')}</Text>
        </View>

        {/* Identificação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificação</Text>
          <View style={styles.row}><Text style={styles.label}>ID do Relatório</Text><Text style={styles.value}>#{relatorio.id}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Modelo da Placa</Text><Text style={styles.value}>{relatorio.placa?.modeloCodigo || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Responsável</Text><Text style={styles.value}>{relatorio.usuarioCriador?.nome || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Data da Execução</Text><Text style={styles.value}>{new Date(relatorio.criadoEm).toLocaleString('pt-BR')}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Imagens Processadas</Text><Text style={styles.value}>{totalImagens}</Text></View>
          {relatorio.usuarioUltimoAcesso && (
            <View style={styles.row}><Text style={styles.label}>Última Modificação por</Text><Text style={styles.value}>{relatorio.usuarioUltimoAcesso.nome}</Text></View>
          )}
        </View>

        {/* Resumo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo dos Defeitos</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{defeitos.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{confirmados.length}</Text>
              <Text style={styles.summaryLabel}>Confirmados</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{falsos.length}</Text>
              <Text style={styles.summaryLabel}>Falsos Positivos</Text>
            </View>
          </View>
        </View>

        {/* Por categoria */}
        {Object.keys(porClasse).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Defeitos por Categoria</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Categoria</Text>
                <Text style={styles.tableHeaderText}>Ocorrências</Text>
                <Text style={styles.tableHeaderText}>Percentual</Text>
              </View>
              {Object.entries(porClasse).map(([classe, count]) => (
                <View key={classe} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{classe}</Text>
                  <Text style={styles.tableCell}>{count}</Text>
                  <Text style={styles.tableCell}>{((count / defeitos.length) * 100).toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Lista de defeitos */}
        {defeitos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Classificação dos Defeitos</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>ID</Text>
                <Text style={styles.tableHeaderText}>Classe</Text>
                <Text style={styles.tableHeaderText}>Tipo</Text>
                <Text style={styles.tableHeaderText}>Classificação</Text>
                <Text style={styles.tableHeaderText}>Data/Hora</Text>
              </View>
              {defeitos.map((rd) => (
                <View key={rd.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>#{rd.defeito?.id}</Text>
                  <Text style={styles.tableCell}>{rd.defeito?.classeDefeito || '-'}</Text>
                  <Text style={styles.tableCell}>{rd.defeito?.tipo || '-'}</Text>
                  <Text style={[styles.tableCell, rd.defeito?.statusConfirmacao === 'confirmado' ? styles.badgeConfirmado : styles.badgeFalso]}>
                    {rd.defeito?.statusConfirmacao === 'confirmado' ? 'Real' : 'Falso Positivo'}
                  </Text>
                  <Text style={styles.tableCell}>{rd.defeito?.dataHora ? new Date(rd.defeito.dataHora).toLocaleString('pt-BR') : '-'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>InspectAI — Sistema de Inspeção de Placas Eletrônicas</Text>
          <Text style={styles.footerText}>Relatório #{relatorio.id} · {new Date().toLocaleDateString('pt-BR')}</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const relatorio = await prisma.relatorio.findUnique({
      where: { id: parseInt(id) },
      include: {
        placa: { include: { modelo: true } },
        usuarioCriador: { select: { id: true, nome: true, email: true } },
        usuarioUltimoAcesso: { select: { id: true, nome: true, email: true } },
        defeitos: {
          include: {
            defeito: true,
          },
        },
        imagens: true,
      },
    })

    if (!relatorio) {
      return NextResponse.json({ success: false, error: 'Relatório não encontrado' }, { status: 404 })
    }

    const buffer = await renderToBuffer(<RelatorioDocument relatorio={relatorio} />)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-${id}-${Date.now()}.pdf"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
