export interface ScheduleItem {
  date: string;
  event: string;
  time_range: string;
  location: string;
}

export const scheduleData: ScheduleItem[] = [
  { 
    date: "2026.04.15", 
    event: "春の癒やしマルシェ出店", 
    time_range: "10:00 - 16:00",
    location: "〇〇広場" 
  },
  { 
    date: "2026.04.22", 
    event: "エンヨー実演販売会", 
    time_range: "11:00 - 17:00",
    location: "Diamond Sweet Pea 店内" 
  },
  { 
    date: "2026.05.03", 
    event: "GWデトックスキャンペーン", 
    time_range: "10:00 - 18:00",
    location: "YOSA PARK" 
  },
  // ここに新しい予定を追加したり、古いものを消したりできます
];
