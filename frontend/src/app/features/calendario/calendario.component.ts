import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core'; // Adicionado ViewEncapsulation
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RotaService } from '../../core/services/rota.service';
import { Rota } from '../../core/models/rota.model';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  rota?: Rota;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './calendario.component.html',
  // Força o uso dos estilos globais (styles.scss) para o Modal funcionar
  encapsulation: ViewEncapsulation.None,
})
export class CalendarioComponent implements OnInit {
  currentDate = signal(new Date());
  calendarDays = signal<CalendarDay[]>([]);
  rotas = signal<Rota[]>([]);
  loading = signal(true);
  modalOpen = signal(false);
  selectedDay = signal<CalendarDay | null>(null);
  saving = signal(false);
  deleting = signal(false);
  form: FormGroup;

  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  constructor(
    private rotaService: RotaService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      valorBruto: ['', [Validators.required, Validators.min(0.01)]],
      kmRodado: ['', [Validators.required, Validators.min(0.01)]],
      litrosAbastecidos: [''],
      valorAbastecimento: [''],
      consumioMedioVeiculo: [10],
    });
  }

  ngOnInit(): void {
    this.loadRotas();
  }

  loadRotas(): void {
    const mes = this.currentDate().getMonth() + 1;
    const ano = this.currentDate().getFullYear();
    this.loading.set(true);
    this.rotaService.getRotas(mes, ano).subscribe({
      next: (rotas) => {
        this.rotas.set(rotas);
        this.buildCalendar();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  buildCalendar(): void {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    const days: CalendarDay[] = [];

    // Dias do mês anterior
    for (let i = firstDay.getDay(); i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push({ date: d, day: d.getDate(), isCurrentMonth: false, isToday: false });
    }

    // Dias do mês atual
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = this.formatDate(date);
      const rota = this.rotas().find((r) => r.dataRota === dateStr);
      const isToday = date.toDateString() === today.toDateString();
      days.push({ date, day: d, isCurrentMonth: true, isToday, rota });
    }

    // Completa a grade com dias do próximo mês
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      days.push({ date, day: d, isCurrentMonth: false, isToday: false });
    }

    this.calendarDays.set(days);
  }

  prevMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.loadRotas();
  }

  nextMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.loadRotas();
  }

  openModal(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    this.selectedDay.set(day);

    // Reseta o formulário com valor padrão de consumo
    this.form.reset({ consumioMedioVeiculo: 10 });

    if (day.rota) {
      this.form.patchValue({
        valorBruto: day.rota.valorBruto,
        kmRodado: day.rota.kmRodado,
        litrosAbastecidos: day.rota.litrosAbastecidos || '',
        valorAbastecimento: day.rota.valorAbastecimento || '',
        consumioMedioVeiculo: day.rota.consumioMedioVeiculo,
      });
    }
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.selectedDay.set(null);
  }

  saveRota(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const day = this.selectedDay();
    if (!day) return;

    this.saving.set(true);
    const dto = {
      ...this.form.value,
      dataRota: this.formatDate(day.date),
      valorBruto: +this.form.value.valorBruto,
      kmRodado: +this.form.value.kmRodado,
      litrosAbastecidos: this.form.value.litrosAbastecidos
        ? +this.form.value.litrosAbastecidos
        : undefined,
      valorAbastecimento: this.form.value.valorAbastecimento
        ? +this.form.value.valorAbastecimento
        : undefined,
      consumioMedioVeiculo: +this.form.value.consumioMedioVeiculo || 10,
    };

    const obs = day.rota
      ? this.rotaService.updateRota(day.rota.id, dto)
      : this.rotaService.createRota(dto);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadRotas();
      },
      error: () => this.saving.set(false),
    });
  }

  deleteRota(): void {
    const day = this.selectedDay();
    if (!day?.rota) return;

    if (!confirm('Tem certeza que deseja excluir esta rota?')) return;

    this.deleting.set(true);
    this.rotaService.deleteRota(day.rota.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.closeModal();
        this.loadRotas();
      },
      error: () => this.deleting.set(false),
    });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get mesAno(): string {
    const d = this.currentDate();
    return `${this.meses[d.getMonth()]} ${d.getFullYear()}`;
  }
}
