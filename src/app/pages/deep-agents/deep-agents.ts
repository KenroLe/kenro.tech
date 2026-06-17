import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { marked } from 'marked';

interface InvokeResponse {
  thread_id: string;
  answer: string | null;
  query_type: string | null;
}

interface HistoryResponse {
  thread_id: string;
  found: boolean;
  messages: { role: 'user' | 'agent'; text: string }[];
}

interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  html?: string; // rendered markdown (agent only)
  queryType?: string | null; // routing label (agent only)
}

@Component({
  selector: 'app-deep-agents',
  imports: [FormsModule],
  templateUrl: './deep-agents.html',
  styleUrl: './deep-agents.scss',
})
export class DeepAgents {
  draft = signal('');
  recallId = signal('');
  running = signal(false);
  error = signal<string | null>(null);
  messages = signal<ChatMessage[]>([]);
  conversationId = signal<string | null>(null);
  copied = signal(false);

  constructor(private http: HttpClient) {}

  private renderAgent(text: string): string {
    return marked.parse(text, { async: false }) as string;
  }

  send() {
    const text = this.draft().trim();
    if (!text || this.running()) return;

    this.messages.update((m) => [...m, { role: 'user', text }]);
    this.draft.set('');
    this.error.set(null);
    this.running.set(true);

    this.http
      .post<InvokeResponse>('/agents/lang-graph-invoke', {
        message: text,
        thread_id: this.conversationId(),
      })
      .subscribe({
        next: (r) => {
          this.conversationId.set(r.thread_id);
          const answer = r.answer ?? '_(no answer)_';
          this.messages.update((m) => [
            ...m,
            {
              role: 'agent',
              text: answer,
              html: this.renderAgent(answer),
              queryType: r.query_type,
            },
          ]);
          this.running.set(false);
        },
        error: () => {
          this.error.set('The agent failed to respond. Please try again.');
          this.running.set(false);
        },
      });
  }

  loadConversation() {
    const id = this.recallId().trim();
    if (!id || this.running()) return;

    this.running.set(true);
    this.error.set(null);

    this.http.get<HistoryResponse>(`/agents/history/${encodeURIComponent(id)}`).subscribe({
      next: (r) => {
        if (!r.found || !r.messages.length) {
          this.error.set(`No conversation found with id "${id}".`);
          this.running.set(false);
          return;
        }
        const msgs: ChatMessage[] = r.messages.map((m) =>
          m.role === 'agent'
            ? { role: 'agent', text: m.text, html: this.renderAgent(m.text) }
            : { role: 'user', text: m.text },
        );
        this.messages.set(msgs);
        this.conversationId.set(r.thread_id);
        this.recallId.set('');
        this.running.set(false);
      },
      error: () => {
        this.error.set('Could not load that conversation. Please try again.');
        this.running.set(false);
      },
    });
  }

  copyId() {
    const id = this.conversationId();
    if (!id) return;
    navigator.clipboard?.writeText(id).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    });
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  newChat() {
    if (this.running()) return;
    this.conversationId.set(null);
    this.messages.set([]);
    this.error.set(null);
  }
}
