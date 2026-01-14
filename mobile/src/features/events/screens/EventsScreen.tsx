import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Text, Icon, Badge } from '@/components/atoms';
import { EventCard } from '@/components/molecules';
import { CalendarWidget } from '@/features/events/components/CalendarWidget';
import { useUpcomingEvents } from '@/features/events/api'; // Reuse for now

export const EventsScreen = () => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [refreshing, setRefreshing] = useState(false);

  // Using mock/API data
  const { data: events, refetch, isLoading } = useUpcomingEvents();

  // Create marked dates map from events
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    events?.forEach(event => {
      const dateKey = format(new Date(event.start_at), 'yyyy-MM-dd');
      marks[dateKey] = { marked: true, dotColor: '#3E9124' };
    });
    return marks;
  }, [events]);

  // Filter events for selected day
  const dayEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(event => 
      format(new Date(event.start_at), 'yyyy-MM-dd') === selectedDate
    );
  }, [events, selectedDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between bg-white/80 backdrop-blur-md z-10">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-primary rounded-lg items-center justify-center mr-3">
            <Text color="inverse" weight="bold">G</Text>
          </View>
          <Text variant="title" weight="bold">Eventos</Text>
        </View>
        
        {/* View Toggle */}
        <View className="flex-row bg-gray-200 rounded-full p-1">
          <TouchableOpacity 
            onPress={() => setViewMode('calendar')}
            className={`px-4 py-1.5 rounded-full ${viewMode === 'calendar' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text weight="bold" color={viewMode === 'calendar' ? 'primary' : 'secondary'} className="text-xs">
              Calendario
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setViewMode('list')}
            className={`px-4 py-1.5 rounded-full ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text weight="bold" color={viewMode === 'list' ? 'primary' : 'secondary'} className="text-xs">
              Lista
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="pb-24 px-6 pt-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9124" />
        }
      >
        {viewMode === 'calendar' && (
          <CalendarWidget 
            selectedDate={selectedDate}
            markedDates={markedDates}
            onDayPress={handleDayPress}
          />
        )}

        {/* Agenda Section */}
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text variant="label" color="secondary" weight="bold" className="uppercase tracking-widest mb-1">
              {viewMode === 'calendar' ? 'AGENDA DEL DÍA' : 'PRÓXIMOS EVENTOS'}
            </Text>
            <Text variant="title" weight="bold">
              {viewMode === 'calendar' 
                ? format(new Date(selectedDate), "EEEE, d 'de' MMMM", { locale: es }) 
                : 'Todos los eventos'}
            </Text>
          </View>
          {viewMode === 'calendar' && (
            <Badge variant="status" status="success" value={`${dayEvents.length} Actividades`} />
          )}
        </View>

        {/* Events List */}
        <View className="space-y-4">
          {(viewMode === 'calendar' ? dayEvents : events)?.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              time={format(new Date(event.start_at), 'h:mm a')}
              location={event.location_text}
              points={50}
            />
          ))}

          {viewMode === 'calendar' && dayEvents.length === 0 && (
            <View className="items-center justify-center py-12 opacity-50">
              <Text className="text-4xl mb-4">😴</Text>
              <Text variant="body" weight="medium" className="text-center">
                No hay eventos programados{'\n'}para este día.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 bg-secondary rounded-full items-center justify-center shadow-lg shadow-secondary/40"
        onPress={() => {}} // TODO: Create event or filter action
      >
        <Text className="text-3xl text-white mb-1">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
