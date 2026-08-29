import { DownloadTask, VideoQuality, VideoItem, AppSettings } from '../types';
import { StorageService } from './storageService';
import confetti from 'canvas-confetti';

export type DownloadListener = (tasks: DownloadTask[]) => void;

class DownloadEngine {
  private tasks: DownloadTask[] = [];
  private listeners: DownloadListener[] = [];
  private timer: number | null = null;

  constructor() {
    this.tasks = StorageService.getDownloads();
    this.startWorker();
  }

  public subscribe(listener: DownloadListener): () => void {
    this.listeners.push(listener);
    listener(this.tasks);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    StorageService.saveDownloads(this.tasks);
    this.listeners.forEach((l) => l([...this.tasks]));
  }

  public getTasks(): DownloadTask[] {
    return [...this.tasks];
  }

  public startDownload(
    video: VideoItem,
    quality: VideoQuality,
    settings: AppSettings,
    platform: 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'web' = 'youtube'
  ): DownloadTask {
    const isAudio = quality.type === 'audio';
    const extension = quality.format.toLowerCase();
    const cleanTitle = video.title.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 50);
    const fileName = `${cleanTitle}_${quality.resolution}.${extension}`;
    const filePath = `${settings.downloadLocation}/${fileName}`;

    // Create unique ID
    const taskId = `dl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newTask: DownloadTask = {
      id: taskId,
      videoId: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      channelName: video.channel.name,
      quality: quality.label,
      format: quality.format,
      status: 'downloading',
      progress: 0,
      downloadedBytes: 0,
      totalBytes: quality.sizeBytes || 45000000,
      speed: '0.0 MB/s',
      eta: 'Calculating...',
      filePath,
      videoUrl: video.videoUrl,
      timestamp: Date.now(),
      platform,
      isAudioOnly: isAudio,
    };

    // Check concurrent active limit
    const activeCount = this.tasks.filter((t) => t.status === 'downloading').length;
    if (activeCount >= settings.maxConcurrentDownloads) {
      newTask.status = 'queued';
    }

    this.tasks = [newTask, ...this.tasks];
    this.notify();
    return newTask;
  }

  public pauseDownload(id: string): void {
    this.tasks = this.tasks.map((t) => (t.id === id && t.status === 'downloading' ? { ...t, status: 'paused', speed: '0.0 MB/s' } : t));
    this.notify();
  }

  public resumeDownload(id: string): void {
    this.tasks = this.tasks.map((t) => (t.id === id && (t.status === 'paused' || t.status === 'failed') ? { ...t, status: 'downloading' } : t));
    this.notify();
  }

  public cancelDownload(id: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.notify();
  }

  public retryDownload(id: string): void {
    this.tasks = this.tasks.map((t) => (t.id === id ? { ...t, status: 'downloading', progress: 0, downloadedBytes: 0 } : t));
    this.notify();
  }

  // Batch actions
  public batchPause(ids: string[]): void {
    this.tasks = this.tasks.map((t) => (ids.includes(t.id) && t.status === 'downloading' ? { ...t, status: 'paused', speed: '0.0 MB/s' } : t));
    this.notify();
  }

  public batchResume(ids: string[]): void {
    this.tasks = this.tasks.map((t) => (ids.includes(t.id) && (t.status === 'paused' || t.status === 'failed') ? { ...t, status: 'downloading' } : t));
    this.notify();
  }

  public batchDelete(ids: string[]): void {
    this.tasks = this.tasks.filter((t) => !ids.includes(t.id));
    this.notify();
  }

  public clearAllCompleted(): void {
    this.tasks = this.tasks.filter((t) => t.status !== 'completed');
    this.notify();
  }

  private startWorker() {
    if (this.timer) return;
    this.timer = window.setInterval(() => {
      let hasChanges = false;
      const settings = StorageService.getSettings();
      let activeCount = this.tasks.filter((t) => t.status === 'downloading').length;

      // Promote queued to downloading if below limit
      if (activeCount < settings.maxConcurrentDownloads) {
        for (let i = 0; i < this.tasks.length; i++) {
          if (this.tasks[i].status === 'queued' && activeCount < settings.maxConcurrentDownloads) {
            this.tasks[i].status = 'downloading';
            activeCount++;
            hasChanges = true;
          }
        }
      }

      this.tasks = this.tasks.map((task) => {
        if (task.status !== 'downloading') return task;

        hasChanges = true;
        // Step progress with realistic download speed (3.5MB/s - 7.5MB/s)
        const speedMbps = 3.5 + Math.random() * 4.0;
        const bytesPerTick = Math.floor((speedMbps * 1024 * 1024) / 2); // runs every 500ms
        const newDownloaded = Math.min(task.totalBytes, task.downloadedBytes + bytesPerTick);
        const progress = Math.min(100, Math.round((newDownloaded / task.totalBytes) * 100));

        const remainingBytes = task.totalBytes - newDownloaded;
        const secondsLeft = Math.max(1, Math.round(remainingBytes / (speedMbps * 1024 * 1024)));
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        const eta = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (progress >= 100) {
          // Trigger confetti on complete
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.85 },
              colors: ['#FF0033', '#10B981', '#3B82F6', '#F59E0B']
            });
          } catch {
            // ignore
          }

          return {
            ...task,
            status: 'completed',
            progress: 100,
            downloadedBytes: task.totalBytes,
            speed: 'Done',
            eta: 'Complete',
          };
        }

        return {
          ...task,
          progress,
          downloadedBytes: newDownloaded,
          speed: `${speedMbps.toFixed(1)} MB/s`,
          eta,
        };
      });

      if (hasChanges) {
        this.notify();
      }
    }, 600);
  }
}

export const downloadEngine = new DownloadEngine();
