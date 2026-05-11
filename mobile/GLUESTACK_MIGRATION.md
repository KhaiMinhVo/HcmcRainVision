# Gluestack UI Migration Guide

## ✅ Đã hoàn thành

### 1. Setup Gluestack UI

- ✅ Đã cài đặt gluestack-ui v3
- ✅ Đã config GluestackUIProvider trong App.js
- ✅ Đã setup Tailwind CSS
- ✅ Đã thêm các components: Button, Input, Card, Badge, Divider, Text, Heading, Spinner, VStack, HStack, Box, Center, FormControl

### 2. Screens đã chuyển đổi

- ✅ **LoginScreen.tsx** - Authentication với gluestack UI
- ✅ **RegisterScreen.tsx** - Registration với gluestack UI
- ✅ **ChangePasswordScreen.tsx** - Change password với gluestack UI

## 📝 Hướng dẫn sử dụng Gluestack UI Components

### Import Components

```tsx
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
```

### Button Usage

```tsx
<Button size="lg" onPress={handleSubmit} isDisabled={loading}>
  {loading && <ButtonSpinner />}
  <ButtonText>Submit</ButtonText>
</Button>
```

### Input with Icon

```tsx
<Input size="lg" variant="outline">
  <InputField
    placeholder="Enter password"
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
  />
  <InputSlot className="pr-3" onPress={() => setShowPassword(!showPassword)}>
    <InputIcon
      as={showPassword ? Eye : EyeOff}
      className="text-typography-500"
    />
  </InputSlot>
</Input>
```

### Layout Components

```tsx
<VStack space="lg" className="p-4">
  <Text size="md">Content</Text>
</VStack>

<HStack space="md" className="items-center">
  <Text>Left</Text>
  <Text>Right</Text>
</HStack>
```

### Styling với Tailwind

- `className="bg-primary-500"` - Background color
- `className="text-typography-900"` - Text color
- `className="p-4"` - Padding
- `className="rounded-lg"` - Border radius
- `className="flex-1"` - Flex
- `className="items-center justify-center"` - Alignment

## 🎨 Design System

### Colors

- **Primary**: `primary-50` đến `primary-900`
- **Background**: `background-0` đến `background-950`
- **Typography**: `typography-0` đến `typography-900`
- **Border**: `border-0` đến `border-900`
- **Error**: `error-50` đến `error-900`
- **Success**: `success-50` đến `success-900`

### Sizes

- **Text**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- **Button**: `xs`, `sm`, `md`, `lg`, `xl`
- **Input**: `sm`, `md`, `lg`, `xl`

### Spacing

- `space="xs"` - 4px
- `space="sm"` - 8px
- `space="md"` - 12px
- `space="lg"` - 16px
- `space="xl"` - 20px
- `space="2xl"` - 24px

## 🔄 Migration Pattern

### Before (StyleSheet)

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
});

<View style={styles.container}>
  <TouchableOpacity style={styles.button}>
    <Text>Click</Text>
  </TouchableOpacity>
</View>;
```

### After (Gluestack + Tailwind)

```tsx
<Box className="flex-1 p-4 bg-background-0">
  <Button size="md" className="rounded-lg">
    <ButtonText>Click</ButtonText>
  </Button>
</Box>
```

## 📦 Dependencies Added

- `@gluestack-ui/themed` - UI components
- `@gluestack-style/react` - Styling system
- `nativewind` - Tailwind CSS for React Native
- `lucide-react-native` - Icons library

## 🚀 Next Steps

Để chuyển đổi thêm screens:

1. Đổi file `.js` → `.tsx`
2. Import gluestack components
3. Replace StyleSheet với Tailwind classes
4. Replace React Native components với gluestack equivalents
5. Test UI và functionality

## 📖 Resources

- [Gluestack UI Docs](https://gluestack.io/ui/docs/home/overview/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)
