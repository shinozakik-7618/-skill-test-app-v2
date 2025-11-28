import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Calendar, Tag, ArrowLeft } from 'lucide-react';
import {
  getAnnouncements,
  getThisWeekAnnouncements,
  getAnnouncementsByType,
  getUnreadCount,
  getThisWeekUnreadCount,
  getUnreadCountByType,
  markAsRead,
  markAllAsRead,
  getReadAnnouncementIds,
  getTypeIcon,
  getTypeLabel,
  getTypeColor
} from '../data/announcements';
import { Announcement } from '../types';

const AnnouncementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = () => {
    const allAnnouncements = getAnnouncements();
    setAnnouncements(allAnnouncements);
    setUnreadCount(getUnreadCount());
    setReadIds(getReadAnnouncementIds());
  };

  const handleMarkAsRead = (announcementId: string) => {
    markAsRead(announcementId);
    loadAnnouncements();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    loadAnnouncements();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  const filteredAnnouncements = selectedType === 'all' 
    ? announcements 
    : selectedType === 'thisweek'
    ? getThisWeekAnnouncements()
    : getAnnouncementsByType(selectedType as 'update' | 'addition' | 'important');

  const types = [
    { value: 'all', label: 'すべて', icon: '📌' },
    { value: 'thisweek', label: '今週更新', icon: '📅' },
    { value: 'update', label: '更新', icon: '🔄' },
    { value: 'addition', label: '追加', icon: '✨' },
    { value: 'important', label: '重要', icon: '⚠️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">ホームに戻る</span>
        </button>

        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">更新情報・お知らせ</h1>
                <p className="text-sm text-gray-600">新機能や問題追加の情報をチェック</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                すべて既読
              </button>
            )}
          </div>

          {/* 未読件数 */}
          {unreadCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <span className="font-bold">{unreadCount}件</span>の未読のお知らせがあります
              </p>
            </div>
          )}
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">フィルター:</span>
            {types.map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* お知らせリスト */}
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">該当するお知らせはありません</p>
            </div>
          ) : (
            filteredAnnouncements.map(announcement => {
              const isRead = readIds.includes(announcement.id);
              return (
                <div
                  key={announcement.id}
                  className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                    !isRead ? 'border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getTypeIcon(announcement.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(announcement.type)}`}>
                            {getTypeLabel(announcement.type)}
                          </span>
                          {!isRead && (
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                              未読
                            </span>
                          )}
                          {announcement.category && (
                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                              {announcement.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(announcement.date)}</span>
                        </div>
                      </div>
                    </div>
                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(announcement.id)}
                        className="ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        既読にする
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 統計情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">お知らせ統計</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{announcements.length}</p>
              <p className="text-sm text-gray-600">総お知らせ数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{unreadCount}</p>
              <p className="text-sm text-gray-600">未読</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {getThisWeekAnnouncements().length}
              </p>
              <p className="text-sm text-gray-600">今週更新</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {getAnnouncementsByType('update').length}
              </p>
              <p className="text-sm text-gray-600">更新</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {getAnnouncementsByType('addition').length}
              </p>
              <p className="text-sm text-gray-600">追加</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
