import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  GestureResponderEvent,
  Modal,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Svg, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTheme } from './utils/themeContext';
import { useAuth } from './utils/authContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  id: string;
  color: string;
  width: number;
  opacity?: number;
  points: Point[];
};

type CharacterDrawing = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  personality: string;
  dream: string;
  strokes: Stroke[];
};

const STORAGE_KEY = 'peeky_character_drawings';

const PEN_COLORS = [
  '#111827', // siyah
  '#EF4444', // kırmızı
  '#F97316', // turuncu
  '#FACC15', // sarı
  '#22C55E', // yeşil
  '#2DD4BF', // turkuaz
  '#3B82F6', // mavi
  '#8B5CF6', // mor
  '#EC4899', // pembe
  '#FB7185', // pastel pembe
  '#A5B4FC', // pastel mavi
  '#BBF7D0', // pastel yeşil
];

const generateId = () => {
  return `draw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const DrawingWorkshopScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { profile } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<CharacterDrawing[]>([]);
  const [current, setCurrent] = useState<CharacterDrawing | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<'create' | 'draw' | 'history'>('create');

  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const strokesRef = useRef<Stroke[]>([]);
  const [penColor, setPenColor] = useState('#111827');
  const [penWidth, setPenWidth] = useState(4);
  const [penOpacity, setPenOpacity] = useState(1);
  const [showPenSettings, setShowPenSettings] = useState(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          if (!canvasWidth || !canvasHeight) return;
          const { locationX, locationY } = evt.nativeEvent;
          const normX = locationX / canvasWidth;
          const normY = locationY / canvasHeight;
          const newStroke: Stroke = {
            id: generateId(),
            color: penColor,
            width: penWidth,
            opacity: penOpacity,
            points: [{ x: normX, y: normY }],
          };
          strokesRef.current = [...strokesRef.current, newStroke];
          setCurrent((prev) =>
            prev
              ? {
                  ...prev,
                  strokes: strokesRef.current,
                }
              : prev
          );
        },
        onPanResponderMove: (evt: GestureResponderEvent, _gesture: PanResponderGestureState) => {
          if (!canvasWidth || !canvasHeight) return;
          if (strokesRef.current.length === 0) return;

          const { locationX, locationY } = evt.nativeEvent;
          const normX = Math.max(0, Math.min(1, locationX / canvasWidth));
          const normY = Math.max(0, Math.min(1, locationY / canvasHeight));

          const lastStroke = strokesRef.current[strokesRef.current.length - 1];
          const updatedStroke: Stroke = {
            ...lastStroke,
            points: [...lastStroke.points, { x: normX, y: normY }],
          };

          strokesRef.current = [...strokesRef.current.slice(0, -1), updatedStroke];
          setCurrent((prev) =>
            prev
              ? {
                  ...prev,
                  strokes: strokesRef.current,
                }
              : prev
          );
        },
        onPanResponderRelease: () => {},
        onPanResponderTerminate: () => {},
      }),
    [canvasWidth, canvasHeight, penColor, penWidth, penOpacity]
  );

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHistory([]);
        setCurrent(null);
        setStep('create');
        strokesRef.current = [];
        return;
      }
      const parsed: CharacterDrawing[] = JSON.parse(raw);
      setHistory(parsed);
      if (parsed.length > 0) {
        setCurrent(null);
        setStep('history');
        strokesRef.current = [];
      } else {
        setCurrent(null);
        setStep('create');
        strokesRef.current = [];
      }
    } catch (error) {
      console.warn('Failed to load character drawings from storage', error);
      setHistory([]);
      setCurrent(null);
      setStep('create');
      strokesRef.current = [];
    } finally {
      setIsLoading(false);
    }
  }, [profile?.nickname]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleChangeField = (field: 'name' | 'personality' | 'dream', value: string) => {
    setCurrent((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : prev
    );
  };

  const handleNewCharacter = () => {
    const fresh: CharacterDrawing = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: profile?.nickname ? `${profile.nickname}'nin Yeni Karakteri` : 'Yeni Karakter',
      personality: '',
      dream: '',
      strokes: [],
    };
    setCurrent(fresh);
    strokesRef.current = [];
    setStep('create');
  };

  const handleClearForm = () => {
    const base = ensureCurrentForCreate();
    setCurrent({
      ...base,
      name: '',
      personality: '',
      dream: '',
      strokes: [],
    });
  };

  const handleSelectFromHistory = (item: CharacterDrawing) => {
    setCurrent(item);
    strokesRef.current = item.strokes || [];
    setStep('draw');
  };

  const handleClearCanvas = () => {
    if (!current) return;
    strokesRef.current = [];
    setCurrent({
      ...current,
      strokes: [],
    });
  };

  const saveToStorage = async (next: CharacterDrawing, existing: CharacterDrawing[]) => {
    const filtered = existing.filter((d) => d.id !== next.id);
    const updatedList = [next, ...filtered].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    setHistory(updatedList);
  };

  const handleSave = async () => {
    if (!current) return;
    try {
      setIsSaving(true);
      const now = new Date().toISOString();
      const withMeta: CharacterDrawing = {
        ...current,
        updatedAt: now,
        strokes: strokesRef.current,
      };
      await saveToStorage(withMeta, history);
      setCurrent(withMeta);
      setStep('history');
    } catch (error) {
      console.warn('Failed to save character drawing', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStrokePath = useCallback(
    (stroke: Stroke) => {
      if (!canvasWidth || !canvasHeight || stroke.points.length === 0) return null;
      const d = stroke.points
        .map((p, idx) => {
          const x = p.x * canvasWidth;
          const y = p.y * canvasHeight;
          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
      return (
        <Path
          key={stroke.id}
          d={d}
          stroke={stroke.color}
          strokeWidth={stroke.width}
          strokeOpacity={stroke.opacity ?? 1}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    },
    [canvasWidth, canvasHeight]
  );

  const historyEmpty = useMemo(() => history.length === 0, [history.length]);

  const ensureCurrentForCreate = () => {
    if (current) return current;
    return {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: profile?.nickname ? `${profile.nickname}'nin Karakteri` : 'Yeni Karakter',
      personality: '',
      dream: '',
      strokes: [],
    } as CharacterDrawing;
  };

  const headerSubtitle =
    step === 'create'
      ? 'Önce karakterini tanıyalım'
      : step === 'draw'
      ? 'Şimdi onu çizmeye başla'
      : 'Eski kahramanlarını yeniden keşfet';

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Çizim atölyen hazırlanıyor 🎨</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Karakter Atölyesi</Text>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
          </View>
          <View style={styles.headerRight}>
            {step === 'history' && (
              <TouchableOpacity onPress={handleNewCharacter} style={styles.headerNewButton}>
                <Text style={styles.headerNewText}>Yeni</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {step === 'create' && (
            <View style={styles.stepContainer}>
              <View style={styles.formSection}>
                <Text style={styles.label}>Karakter Adı</Text>
                <TextInput
                  style={styles.input}
                  value={ensureCurrentForCreate().name}
                  onChangeText={(text) => {
                    const base = ensureCurrentForCreate();
                    handleChangeField('name', text);
                    setCurrent({
                      ...base,
                      name: text,
                    });
                  }}
                  placeholder="Örneğin: Süper Zıpzıp"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.label}>Nasıl bir kişilik?</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={ensureCurrentForCreate().personality}
                  onChangeText={(text) => {
                    const base = ensureCurrentForCreate();
                    handleChangeField('personality', text);
                    setCurrent({
                      ...base,
                      personality: text,
                    });
                  }}
                  placeholder="Neşeli mi, sakin mi, biraz utangaç mı?"
                  placeholderTextColor="#94A3B8"
                  multiline
                />

                <Text style={styles.label}>En büyük hayali ne?</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={ensureCurrentForCreate().dream}
                  onChangeText={(text) => {
                    const base = ensureCurrentForCreate();
                    handleChangeField('dream', text);
                    setCurrent({
                      ...base,
                      dream: text,
                    });
                  }}
                  placeholder="Uzaya gitmek, dünyanın en hızlı koşucusu olmak..."
                  placeholderTextColor="#94A3B8"
                  multiline
                />

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={handleClearForm}>
                    <Text style={styles.secondaryButtonText}>Temizle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      const base = ensureCurrentForCreate();
                      setCurrent(base);
                      strokesRef.current = base.strokes || [];
                      setStep('draw');
                    }}
                  >
                    <Text style={styles.primaryButtonText}>Çizime Geç</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {step === 'draw' && current && (
            <View style={styles.stepContainer}>
              <View style={styles.canvasWrapperLarge}>
                <View style={styles.canvasHeader}>
                  <Text style={styles.canvasTitle}>{current.name || 'Karakter Çizimi'}</Text>
                  <TouchableOpacity onPress={handleClearCanvas}>
                    <Text style={styles.clearText}>Temizle</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.penRow}>
                  <TouchableOpacity
                    style={styles.penButton}
                    onPress={() => setShowPenSettings(true)}
                    activeOpacity={0.9}
                  >
                    <View style={[styles.penPreview, { borderColor: penColor }]}>
                      <View
                        style={[
                          styles.penPreviewInner,
                          {
                            backgroundColor: penColor,
                            opacity: penOpacity,
                            height: Math.max(4, penWidth),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.penButtonText}>Renk & Kalem</Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={styles.canvasLarge}
                  onLayout={(e) => {
                    const { width: w, height: h } = e.nativeEvent.layout;
                    setCanvasWidth(w);
                    setCanvasHeight(h);
                  }}
                  {...panResponder.panHandlers}
                >
                  <Svg width="100%" height="100%">
                    {strokesRef.current.map((stroke) => renderStrokePath(stroke))}
                  </Svg>
                  {strokesRef.current.length === 0 && (
                    <View style={styles.canvasHintContainer}>
                      <Text style={styles.canvasHintText}>Parmağınla karakterini çizmeye başla ✍️</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setStep(historyEmpty ? 'create' : 'history');
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Geri</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Kaydet</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 'history' && (
            <View style={styles.stepContainer}>
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Geçmiş Karakterler</Text>
                {historyEmpty ? (
                  <Text style={styles.historyEmptyText}>
                    Henüz kaydedilmiş bir karakterin yok. Önce yeni bir karakter oluştur.
                  </Text>
                ) : (
                  <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.historyList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.historyCard}
                        onPress={() => handleSelectFromHistory(item)}
                        activeOpacity={0.9}
                      >
                        <View style={styles.historyCanvasPreview}>
                          <Svg width="100%" height="100%">
                            {item.strokes?.map((stroke) => {
                              if (stroke.points.length === 0) return null;
                              const d = stroke.points
                                .map((p, idx) => {
                                  const x = canvasWidth ? p.x * canvasWidth : p.x * 120;
                                  const y = canvasHeight ? p.y * canvasHeight : p.y * 80;
                                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                })
                                .join(' ');
                              return (
                                <Path
                                  key={stroke.id}
                                  d={d}
                                  stroke={stroke.color}
                                  strokeWidth={stroke.width}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  fill="none"
                                />
                              );
                            })}
                          </Svg>
                        </View>
                        <Text style={styles.historyName} numberOfLines={1}>
                          {item.name || 'İsimsiz Karakter'}
                        </Text>
                        <Text style={styles.historySub}>
                          {new Date(item.updatedAt).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
      {step === 'draw' && (
        <Modal
          visible={showPenSettings}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPenSettings(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Renk Seçimi</Text>
              <View style={styles.modalColorsGrid}>
                {PEN_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color },
                      penColor === color && styles.colorDotSelected,
                    ]}
                    onPress={() => setPenColor(color)}
                  />
                ))}
              </View>

              <Text style={styles.modalSubtitle}>Kalem Kalınlığı</Text>
              <View style={styles.penWidthRow}>
                {[2, 4, 6, 8].map((w) => (
                  <TouchableOpacity
                    key={w}
                    style={[
                      styles.penWidthButton,
                      penWidth === w && styles.penWidthButtonSelected,
                    ]}
                    onPress={() => setPenWidth(w)}
                  >
                    <View style={[styles.penWidthPreview, { height: w }]} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalSubtitle}>Stil</Text>
              <View style={styles.penStyleRow}>
                <TouchableOpacity
                  style={[
                    styles.penStyleButton,
                    penOpacity === 1 && styles.penStyleButtonSelected,
                  ]}
                  onPress={() => setPenOpacity(1)}
                >
                  <Text
                    style={[
                      styles.penStyleText,
                      penOpacity === 1 && styles.penStyleTextSelected,
                    ]}
                  >
                    Normal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.penStyleButton,
                    penOpacity < 1 && styles.penStyleButtonSelected,
                  ]}
                  onPress={() => setPenOpacity(0.4)}
                >
                  <Text
                    style={[
                      styles.penStyleText,
                      penOpacity < 1 && styles.penStyleTextSelected,
                    ]}
                  >
                    Pastel
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.modalSecondaryButton}
                  onPress={() => setShowPenSettings(false)}
                >
                  <Text style={styles.modalSecondaryText}>Geri</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, styles.modalPrimaryButton]}
                  onPress={() => setShowPenSettings(false)}
                >
                  <Text style={styles.primaryButtonText}>Tamam</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerNewButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  headerNewText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 8,
  },
  formSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 10,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  stepActions: {
    marginTop: 12,
  },
  fullWidthButton: {
    width: '100%',
  },
  canvasWrapperLarge: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  canvasWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  canvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  canvasTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  penRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  penButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  penPreview: {
    width: 40,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#111827',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  penPreviewInner: {
    borderRadius: 999,
  },
  penButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  colorDotSelected: {
    borderColor: '#111827',
    transform: [{ scale: 1.05 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '86%',
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
    marginBottom: 6,
  },
  modalColorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  penWidthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  penWidthButton: {
    flex: 1,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  penWidthButtonSelected: {
    borderColor: '#111827',
    backgroundColor: '#EFF6FF',
  },
  penWidthPreview: {
    width: '70%',
    borderRadius: 999,
    backgroundColor: '#0F172A',
  },
  penStyleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  penStyleButton: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  penStyleButtonSelected: {
    borderColor: '#111827',
    backgroundColor: '#EEF2FF',
  },
  penStyleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  penStyleTextSelected: {
    color: '#111827',
  },
  canvasLarge: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasHintContainer: {
    position: 'absolute',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  canvasHintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7000FF',
    shadowColor: '#7000FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  modalSecondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  modalSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  modalPrimaryButton: {
    flex: 1,
    height: 44,
  },
  primaryButtonDisabled: {
    opacity: 0.75,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  historySection: {
    marginTop: 4,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  historyEmptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  historyList: {
    paddingVertical: 4,
  },
  historyCard: {
    width: 140,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  historyCanvasPreview: {
    width: '100%',
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 6,
  },
  historyName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  historySub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});

export default DrawingWorkshopScreen;

