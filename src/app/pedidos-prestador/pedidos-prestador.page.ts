import { Component, OnInit } from '@angular/core';
import { ColetaBackendService, IColetaUser } from 'src/app/services/coleta-backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedidos-prestador',
  templateUrl: './pedidos-prestador.page.html',
  styleUrls: ['./pedidos-prestador.page.scss'],
  standalone: false,
})
export class PedidosPrestadorPage implements OnInit {

  solicitacoesAceitas: any[] = [];
  solicitacoesConcluidas: any[] = []; // Nova lista para pedidos concluídos
  usuarioLogado!: IColetaUser;

  constructor(
    private coletaService: ColetaBackendService,
    private router: Router
  ) { }

  ngOnInit() {
    this.carregarUsuarioEColetas();
  }

  ionViewWillEnter() {
    // Recarregar dados sempre que a página for exibida
    this.carregarUsuarioEColetas();
  }

  carregarUsuarioEColetas() {
    this.coletaService.getCurrentUserData().subscribe({
      next: (res: any) => {
        this.usuarioLogado = res.data!;
        this.coletaService.listarSolicitacoes(1, 100).subscribe({
          next: (res: any) => {
            // Filtrar pedidos aceitos (em andamento)
            this.solicitacoesAceitas = res.data.filter((s: any) =>
              s.progress === 'accepted' &&
              s.employeeId === this.usuarioLogado.id
            );
            
            // Filtrar pedidos concluídos
            this.solicitacoesConcluidas = res.data.filter((s: any) =>
              s.progress === 'completed' &&
              s.employeeId === this.usuarioLogado.id
            );
          }
        });
      }
    });
  }

  abrirPedido(id: number) {
    this.router.navigate(['/pedido-prestador', id]);
  }
}
