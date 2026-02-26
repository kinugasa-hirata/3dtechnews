import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Tag, Factory, Globe, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TAGS, CATEGORIES, MAKERS, COUNTRIES } from '@/types';
import { getCalendarEvents } from '@/data/mockArticles';

interface SidebarProps {
  selectedTags: string[];
  selectedCategories: string[];
  selectedMakers: string[];
  selectedCountries: string[];
  selectedDate: Date | null;
  activeFiltersCount: number;
  onToggleTag: (tag: string) => void;
  onToggleCategory: (category: string) => void;
  onToggleMaker: (maker: string) => void;
  onToggleCountry: (country: string) => void;
  onSelectDate: (date: Date | null) => void;
  onClearFilters: () => void;
}

export function Sidebar({
  selectedTags,
  selectedCategories,
  selectedMakers,
  selectedCountries,
  selectedDate,
  activeFiltersCount,
  onToggleTag,
  onToggleCategory,
  onToggleMaker,
  onToggleCountry,
  onSelectDate,
  onClearFilters,
}: SidebarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedSections, setExpandedSections] = useState({
    calendar: true,
    tags: true,
    categories: true,
    makers: false,
    countries: false,
  });

  const calendarEvents = getCalendarEvents();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startingDayIndex = getDay(startOfMonth(currentMonth));

  const hasEventOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return calendarEvents.some(event => event.date === dateStr);
  };

  const getEventCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const event = calendarEvents.find(e => e.date === dateStr);
    return event?.count || 0;
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="glass rounded-xl p-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#FF6B35]" />
              <span className="font-medium text-sm">適用中のフィルター</span>
            </div>
            <Badge variant="secondary" className="bg-[#FF6B35]/10 text-[#FF6B35]">
              {activeFiltersCount}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-red-50" onClick={() => onToggleTag(tag)}>
                {tag} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {selectedCategories.map(cat => {
              const category = CATEGORIES.find(c => c.id === cat);
              return (
                <Badge key={cat} variant="outline" className="cursor-pointer hover:bg-red-50" onClick={() => onToggleCategory(cat)}>
                  {category?.name} <X className="w-3 h-3 ml-1" />
                </Badge>
              );
            })}
            {selectedMakers.map(maker => {
              const m = MAKERS.find(mk => mk.id === maker);
              return (
                <Badge key={maker} variant="outline" className="cursor-pointer hover:bg-red-50" onClick={() => onToggleMaker(maker)}>
                  {m?.name} <X className="w-3 h-3 ml-1" />
                </Badge>
              );
            })}
            {selectedCountries.map(country => {
              const c = COUNTRIES.find(ct => ct.id === country);
              return (
                <Badge key={country} variant="outline" className="cursor-pointer hover:bg-red-50" onClick={() => onToggleCountry(country)}>
                  {c?.name} <X className="w-3 h-3 ml-1" />
                </Badge>
              );
            })}
            {selectedDate && (
              <Badge variant="outline" className="cursor-pointer hover:bg-red-50" onClick={() => onSelectDate(null)}>
                {format(selectedDate, 'M月d日')} <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="w-full mt-3 text-gray-500 hover:text-gray-700"
          >
            すべてクリア
          </Button>
        </div>
      )}

      {/* Calendar */}
      <div className="glass rounded-xl p-4">
        <button
          onClick={() => toggleSection('calendar')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#FF6B35]" />
            <span className="font-medium text-sm">カレンダー</span>
          </div>
          <ChevronLeft className={`w-4 h-4 transition-transform ${expandedSections.calendar ? '-rotate-90' : ''}`} />
        </button>
        
        {expandedSections.calendar && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-sm">
                {format(currentMonth, 'yyyy年M月', { locale: ja })}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs text-gray-500 py-1">
                  {day}
                </div>
              ))}
              {Array.from({ length: startingDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {daysInMonth.map(day => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const hasEvent = hasEventOnDate(day);
                const eventCount = getEventCount(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => onSelectDate(isSelected ? null : day)}
                    className={`
                      relative w-8 h-8 text-xs rounded-full transition-all duration-200
                      flex items-center justify-center
                      ${isSelected 
                        ? 'bg-[#FF6B35] text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                      ${!isCurrentMonth && 'opacity-30'}
                    `}
                  >
                    {format(day, 'd')}
                    {hasEvent && !isSelected && (
                      <span className="absolute -bottom-0.5 w-1 h-1 bg-[#FF6B35] rounded-full" />
                    )}
                    {eventCount > 1 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B35] text-white text-[10px] rounded-full flex items-center justify-center">
                        {eventCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="glass rounded-xl p-4">
        <button
          onClick={() => toggleSection('tags')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#FF6B35]" />
            <span className="font-medium text-sm">タグ</span>
          </div>
          <ChevronLeft className={`w-4 h-4 transition-transform ${expandedSections.tags ? '-rotate-90' : ''}`} />
        </button>
        
        {expandedSections.tags && (
          <div className="flex flex-wrap gap-2 animate-fade-in-up">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={`
                  px-3 py-1.5 text-xs rounded-full border transition-all duration-200
                  ${selectedTags.includes(tag)
                    ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35]'
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="glass rounded-xl p-4">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#FF6B35]" />
            <span className="font-medium text-sm">カテゴリー</span>
          </div>
          <ChevronLeft className={`w-4 h-4 transition-transform ${expandedSections.categories ? '-rotate-90' : ''}`} />
        </button>
        
        {expandedSections.categories && (
          <div className="space-y-2 animate-fade-in-up">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => onToggleCategory(category.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200
                  ${selectedCategories.includes(category.id)
                    ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                    : 'hover:bg-gray-100 text-gray-600'
                  }
                `}
              >
                <span>{category.name}</span>
                {selectedCategories.includes(category.id) && (
                  <X className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Makers */}
      <div className="glass rounded-xl p-4">
        <button
          onClick={() => toggleSection('makers')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-[#FF6B35]" />
            <span className="font-medium text-sm">メーカー</span>
          </div>
          <ChevronLeft className={`w-4 h-4 transition-transform ${expandedSections.makers ? '-rotate-90' : ''}`} />
        </button>
        
        {expandedSections.makers && (
          <div className="space-y-2 animate-fade-in-up max-h-64 overflow-y-auto">
            {MAKERS.map(maker => (
              <button
                key={maker.id}
                onClick={() => onToggleMaker(maker.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200
                  ${selectedMakers.includes(maker.id)
                    ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                    : 'hover:bg-gray-100 text-gray-600'
                  }
                `}
              >
                <div className="flex flex-col items-start">
                  <span>{maker.name}</span>
                  <span className="text-xs text-gray-400">{maker.country}</span>
                </div>
                {selectedMakers.includes(maker.id) && (
                  <X className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Countries */}
      <div className="glass rounded-xl p-4">
        <button
          onClick={() => toggleSection('countries')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#FF6B35]" />
            <span className="font-medium text-sm">国・地域</span>
          </div>
          <ChevronLeft className={`w-4 h-4 transition-transform ${expandedSections.countries ? '-rotate-90' : ''}`} />
        </button>
        
        {expandedSections.countries && (
          <div className="space-y-2 animate-fade-in-up">
            {COUNTRIES.map(country => (
              <button
                key={country.id}
                onClick={() => onToggleCountry(country.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200
                  ${selectedCountries.includes(country.id)
                    ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                    : 'hover:bg-gray-100 text-gray-600'
                  }
                `}
              >
                <span>{country.name}</span>
                {selectedCountries.includes(country.id) && (
                  <X className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
