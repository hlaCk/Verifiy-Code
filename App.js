/*
          
          
};*/

import {Animated, Image, SafeAreaView, Text, View} from 'react-native';
import React, {useState} from 'react';
import * as ReadSms from 'react-native-read-sms/ReadSms';

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

import styles, {
  ACTIVE_CELL_BG_COLOR,
  CELL_BORDER_RADIUS,
  CELL_SIZE,
  DEFAULT_CELL_BG_COLOR,
  NOT_EMPTY_CELL_BG_COLOR,
} from './styles';

const {Value, Text: AnimatedText} = Animated;

const CELL_COUNT = 4;
const source = {
  uri:
    'https://user-images.githubusercontent.com/4661784/56352614-4631a680-61d8-11e9-880d-86ecb053413d.png',
};

const animationsColor = [...new Array(CELL_COUNT)].map(() => new Value(0));
const animationsScale = [...new Array(CELL_COUNT)].map(() => new Value(1));
const animateCell = ({hasValue, index, isFocused}) => {
  Animated.parallel([
    Animated.timing(animationsColor[index], {
      useNativeDriver: false,
      toValue: isFocused ? 1 : 0,
      duration: 250,
    }),
    Animated.spring(animationsScale[index], {
      useNativeDriver: false,
      toValue: hasValue ? 0 : 1,
      duration: hasValue ? 300 : 250,
    }),
  ]).start();
};

// Reading SMS function
const startReadSMS = async () => {
  // Asking for permisiion if android
  // Otherwise returned true
  const hasPermission = await ReadSms.requestReadSMSPermission();
  if(hasPermission) {
      ReadSms.startReadSMS((status, sms, error) => {
          if (status == "success") {
              console.log("Great!! you have received new sms:", sms);
              // this.setState({sms: sms})
              return sms;
          }
      });
  }
}

const AnimatedExample = () => {
  // Start listining to sms and get the message
  var sms = startReadSMS();
  // Extracted the number from sms
  const resend = true // to hide resend <Text />
  const numberFromSms = sms ? sms.toString().replace( /^\D+/g, '') : resend = true // <================ THIS IS THE NUMBER FROM SMS <=====================
  // Stopp listining to SMS's
  ReadSms.stopReadSMS();

  const resendSms = () => {
    // Ask for a new code 
  }

  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const renderCell = ({index, symbol, isFocused}) => {
    const hasValue = Boolean(symbol);
    const animatedCellStyle = {
      backgroundColor: hasValue
        ? animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [NOT_EMPTY_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
          })
        : animationsColor[index].interpolate({
            inputRange: [0, 1],
            outputRange: [DEFAULT_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
          }),
      borderRadius: animationsScale[index].interpolate({
        inputRange: [0, 1],
        outputRange: [CELL_SIZE, CELL_BORDER_RADIUS],
      }),
      transform: [
        {
          scale: animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1],
          }),
        },
      ],
    };

    // Run animation on next event loop tik
    // Because we need first return new style prop and then animate this value
    setTimeout(() => {
      animateCell({hasValue, index, isFocused});
    }, 0);

    return (
      <AnimatedText
        key={index}
        style={[styles.cell, animatedCellStyle]}
        onLayout={getCellOnLayoutHandler(index)}>
        {symbol || (isFocused ? <Cursor /> : null)}
      </AnimatedText>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Verification</Text>
      <Image style={styles.icon} source={source} />
      <Text style={styles.subTitle}>
        Please enter the verification code{'\n'}
        we send to your phone number
      </Text>
      <Text style={styles.subTitleArabic}>
        يرجى ادخال رمز التأكيد {'\n'}
        المُرسل الى رقم هاتفك
      </Text>

      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={renderCell}
      />
      { resend && <Text
        style={{ marginTop: 25, color: 'blue', textDecorationLine: 'underline', alignSelf: 'center' }}
        onPress={() => { /** ask API to resend new code */ }}
        >
        Resend code -
        إعادة الارسال
        {/* You can edit it */}
      </Text>}
      <View style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Verify</Text>
      </View>
    </SafeAreaView>
    
  );
};

export default AnimatedExample;
