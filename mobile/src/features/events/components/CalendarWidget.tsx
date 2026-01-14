import React from 'react';
import { LocaleConfig, Calendar, DateData } from 'react-native-calendars';
import { View } from 'react-native';

// Configure Spanish locale
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sept.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

interface CalendarWidgetProps {
  selectedDate: string;
  markedDates: Record<string, any>;
  onDayPress: (date: DateData) => void;
}

export const CalendarWidget = ({ selectedDate, markedDates, onDayPress }: CalendarWidgetProps) => {
  return (
    <View className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6">
      <Calendar
        // Language - locale is not a direct prop on Calendar, it relies on LocaleConfig global config
        // but can use 'key' to force re-render if locale changes
        key="es"
        
        // Handling
        onDayPress={onDayPress}
        
        // Marking
        markedDates={{
          ...markedDates,
          [selectedDate]: { 
            selected: true, 
            selectedColor: '#E97B1C', // secondary
            selectedTextColor: '#ffffff'
          }
        }}
        
        // Styling
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#1F2937', // primary text
          textSectionTitleDisabledColor: '#d9e1e8',
          selectedDayBackgroundColor: '#E97B1C',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#E97B1C',
          dayTextColor: '#1F2937',
          textDisabledColor: '#d9e1e8',
          dotColor: '#3E9124', // primary green
          selectedDotColor: '#ffffff',
          arrowColor: '#1F2937',
          disabledArrowColor: '#d9e1e8',
          monthTextColor: '#1F2937',
          indicatorColor: '#3E9124',
          textDayFontFamily: 'PlusJakartaSans_500Medium',
          textMonthFontFamily: 'PlusJakartaSans_700Bold',
          textDayHeaderFontFamily: 'PlusJakartaSans_600SemiBold',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14
        }}
        
        // Features
        enableSwipeMonths={true}
        firstDay={1} // Monday
      />
    </View>
  );
};
