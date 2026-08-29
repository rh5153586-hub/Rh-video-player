import React, { useState } from 'react';
import { DownloadTask, AccentColor, AppSettings, VideoItem } from '../../types';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  Trash2,
  RotateCcw,
  HardDrive,
  Wifi,
  FileVideo,
  Music,
  CheckSquare,
  Square,
  MoreVertical,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadEngine } from '../../services/downloadEngine';

interface DownloadsScreenProps {
  tasks: DownloadTask[];
  accentColor: AccentColor;
  settings: AppSettings;
  onPlayDownloadedVideo: (video: VideoItem) => void;
  onShowSnackBar: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const DownloadsScreen: React.FC<DownloadsScreenProps> = ({
  tasks,
  accentColor,
  settings,
  onPlayDownloadedVideo,
  onShowSnackBar,
}) => {
  const [activeTab, setActiveTab] = useState<'downloading' | 'completed' | 'failed'>('downloading');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const downloadingTasks = tasks.filter((t) => t.status === 'downloading' || t.status === 'queued');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const failedTasks = tasks.filter((t) => t.status === 'paused' || t.status === 'failed');

  const currentList =
    activeTab === 'downloading'
      ? downloadingTasks
      : activeTab === 'completed'
      ? completedTasks
      : failedTasks;

  const toggleSelectTask = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((tId) => tId !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === currentList.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(currentList.map((t) => t.id));
    }
  };

  const handleBatchPause = () => {
    downloadEngine.batchPause(selectedTaskIds);
    onShowSnackBar(`Paused ${selectedTaskIds.length} downloads`, 'info');
    setSelectedTaskIds([]);
    setIsBatchMode(false);
  };

  const handleBatchResume = () => {
    downloadEngine.batchResume(selectedTaskIds);
    onShowSnackBar(`Resumed ${selectedTaskIds.length} downloads`, 'success');
    setSelectedTaskIds([]);
    setIsBatchMode(false);
  };

  const handleBatchDelete = () => {
    downloadEngine.batchDelete(selectedTaskIds);
    onShowSnackBar(`Deleted ${selectedTaskIds.length} tasks`, 'info');
    setSelectedTaskIds([]);
    setIsBatchMode(false);
  };

  const handlePlayCompleted = (task: DownloadTask) => {
    const videoItem: VideoItem = {
      id: task.videoId || task.id,
      title: task.title,
      description: `Downloaded local file: ${task.filePath}`,
      thumbnail: task.thumbnail,
      videoUrl: task.videoUrl,
      duration: 'Offline File',
      durationSeconds: 300,
      views: 'Offline Storage',
      uploadTime: new Date(task.timestamp).toLocaleDateString(),
      category: 'For You',
      channel: {
        id: 'local',
        name: task.channelName,
        avatar: task.thumbnail,
        subscribers: 'Downloaded',
      },
      likesCount: 'Offline',
      qualities: [],
    };
    onPlayDownloadedVideo(videoItem);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="pb-24 pt-2 px-4">
      {/* Storage & Engine Status Card */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-neutral-400" />
            <span className="font-bold text-neutral-200">Device Storage Usage</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">42.8 GB / 128 GB (66% Free)</span>
        </div>

        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 w-[34%] rounded-full" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-500">
          <span className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>{settings.wifiOnlyDownload ? 'Wi-Fi Only Mode' : 'Wi-Fi & Cellular'}</span>
          </span>
          <span>Max Concurrent: {settings.maxConcurrentDownloads} tasks</span>
        </div>
      </div>

      {/* Tabs Header (Downloading, Completed, Paused/Failed) */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-2xl border border-neutral-800/80">
          <button
            onClick={() => {
              setActiveTab('downloading');
              setSelectedTaskIds([]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'downloading'
                ? 'text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            style={{
              backgroundColor: activeTab === 'downloading' ? accentColor.primary : undefined,
            }}
          >
            Downloading ({downloadingTasks.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('completed');
              setSelectedTaskIds([]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'completed'
                ? 'text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            style={{
              backgroundColor: activeTab === 'completed' ? accentColor.primary : undefined,
            }}
          >
            Completed ({completedTasks.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('failed');
              setSelectedTaskIds([]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'failed'
                ? 'text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            style={{
              backgroundColor: activeTab === 'failed' ? accentColor.primary : undefined,
            }}
          >
            Paused ({failedTasks.length})
          </button>
        </div>

        {/* Batch Selection Mode Trigger */}
        {currentList.length > 0 && (
          <button
            onClick={() => {
              setIsBatchMode(!isBatchMode);
              setSelectedTaskIds([]);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              isBatchMode
                ? 'bg-neutral-800 border-neutral-700 text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {isBatchMode ? 'Done' : 'Select'}
          </button>
        )}
      </div>

      {/* Batch Operations Bar */}
      {isBatchMode && currentList.length > 0 && (
        <div className="mt-3 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
          <button onClick={handleSelectAll} className="flex items-center gap-2 font-bold text-neutral-200">
            {selectedTaskIds.length === currentList.length ? (
              <CheckSquare className="w-4 h-4 text-emerald-400" />
            ) : (
              <Square className="w-4 h-4 text-neutral-400" />
            )}
            <span>Select All ({selectedTaskIds.length})</span>
          </button>

          {selectedTaskIds.length > 0 && (
            <div className="flex items-center gap-2">
              {activeTab === 'downloading' && (
                <button
                  onClick={handleBatchPause}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-bold hover:bg-amber-500/30"
                >
                  Pause
                </button>
              )}
              {activeTab === 'failed' && (
                <button
                  onClick={handleBatchResume}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/30"
                >
                  Resume
                </button>
              )}
              <button
                onClick={handleBatchDelete}
                className="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* List Feed */}
      <div className="mt-4 space-y-3">
        {currentList.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <Download className="w-12 h-12 mx-auto text-neutral-600 mb-2" />
            <p className="font-bold text-sm text-neutral-300">
              No {activeTab} downloads
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Tap the download arrow on any video to begin high-speed download
            </p>
          </div>
        ) : (
          currentList.map((task) => {
            const isSelected = selectedTaskIds.includes(task.id);

            return (
              <div
                key={task.id}
                onClick={() => {
                  if (isBatchMode) {
                    toggleSelectTask(task.id);
                  }
                }}
                className={`p-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-neutral-800/90 border-red-500 shadow-md'
                    : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Batch Checkbox */}
                  {isBatchMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectTask(task.id);
                      }}
                      className="mt-2 text-neutral-400"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      if (task.status === 'completed') handlePlayCompleted(task);
                    }}
                    className="relative w-20 h-14 rounded-xl bg-neutral-950 overflow-hidden shrink-0 cursor-pointer"
                  >
                    <img src={task.thumbnail} alt={task.title} className="w-full h-full object-cover" />
                    {task.isAudioOnly ? (
                      <div className="absolute inset-0 bg-purple-950/70 flex items-center justify-center">
                        <Music className="w-5 h-5 text-purple-300" />
                      </div>
                    ) : (
                      task.status === 'completed' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                      )
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => {
                          if (task.status === 'completed') handlePlayCompleted(task);
                        }}
                        className="font-bold text-xs text-neutral-100 line-clamp-1 cursor-pointer hover:text-white"
                      >
                        {task.title}
                      </h4>

                      {/* Single Item Action */}
                      {!isBatchMode && (
                        <div className="flex items-center gap-1 shrink-0">
                          {task.status === 'downloading' && (
                            <button
                              onClick={() => {
                                downloadEngine.pauseDownload(task.id);
                                onShowSnackBar('Download paused', 'info');
                              }}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                              title="Pause"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {(task.status === 'paused' || task.status === 'failed') && (
                            <button
                              onClick={() => {
                                downloadEngine.resumeDownload(task.id);
                                onShowSnackBar('Resuming download...', 'success');
                              }}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400"
                              title="Resume"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              downloadEngine.cancelDownload(task.id);
                              onShowSnackBar('Download removed', 'info');
                            }}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                      <span className="font-semibold text-neutral-300">{task.quality}</span>
                      <span>•</span>
                      <span>{task.channelName}</span>
                    </div>

                    {/* Progress details if Downloading */}
                    {task.status === 'downloading' && (
                      <div className="mt-2 space-y-1">
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${task.progress}%`,
                              backgroundColor: accentColor.primary,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span>
                            {formatBytes(task.downloadedBytes)} / {formatBytes(task.totalBytes)} (
                            {task.progress}%)
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {task.speed} • ETA {task.eta}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Queued indicator */}
                    {task.status === 'queued' && (
                      <p className="text-[10px] text-amber-400 mt-1 font-semibold">
                        Queued (Waiting for next download slot)
                      </p>
                    )}

                    {/* Completed File Actions */}
                    {task.status === 'completed' && (
                      <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="font-mono text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{formatBytes(task.totalBytes)}</span>
                        </span>
                        <button
                          onClick={() => handlePlayCompleted(task)}
                          className="px-2.5 py-1 rounded-lg text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
                          style={{ backgroundColor: accentColor.primary }}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Play</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
