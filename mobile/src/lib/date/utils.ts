import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'PP') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: es });
};

export const getMonthName = (date: Date) => {
  return format(date, 'MMMM yyyy', { locale: es });
};

export const isSameDate = (date1: Date | string, date2: Date | string) => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
};
