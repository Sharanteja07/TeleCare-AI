/**
 * TeleCare AI Support Conversational Engine — SIM-ONLY SCOPE
 * Specialized conversational engine for SIM customer support.
 */

export class AITelecomEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.context = {
      intent: null,
      step: 0,
      data: {},
      turns: 0,
    };
  }

  processMessage(userMessage) {
    this.context.turns += 1;
    const input = userMessage.trim().toLowerCase();

    // 1. Unrelated Broadband / WiFi / Router Filter
    if (this.isUnrelatedBroadbandQuery(input)) {
      return {
        text: "I'm currently focused on SIM-related support. I can help with SIM activation, replacement, lost or damaged SIMs, eSIM issues, PIN/PUK problems, and other SIM-related issues.",
        showEscalationButtons: false,
        category: null,
      };
    }

    // 2. Casual Greetings
    const greetingResponse = this.handleGreetings(input);
    if (greetingResponse) {
      return { text: greetingResponse, showEscalationButtons: false, category: null };
    }

    // 3. Human Support Request
    if (this.isHumanSupportRequest(input)) {
      this.context.intent = 'human_support';
      return {
        text: "I understand. I can help you connect with a support engineer to assist with your SIM card issue.",
        showEscalationButtons: true,
        category: 'SIM Not Working',
      };
    }

    // 4. Failure / Still Not Working Confirmation
    if (this.isFailureConfirmation(input)) {
      return {
        text: "Thanks for checking. If the issue persists, your SIM card may require account activation or physical replacement.",
        showEscalationButtons: true,
        category: this.getCategoryForIntent(this.context.intent),
        customButtons: [
          { label: 'Request SIM Replacement', category: 'SIM Replacement' },
          { label: 'Contact Support Engineer', category: 'SIM Not Working' }
        ]
      };
    }

    // 5. Contextual Multi-turn Follow-ups
    if (this.context.intent) {
      const contextualReply = this.handleContextualFollowup(input);
      if (contextualReply) return contextualReply;
    }

    // 6. Detect SIM Intent
    const detectedIntent = this.detectSIMIntent(input);
    if (detectedIntent) {
      this.context.intent = detectedIntent;
      this.context.step = 1;
      return this.startSIMFlow(detectedIntent, input);
    }

    // 7. Fallback
    return {
      text: "I can help with SIM activation, replacement, lost or damaged SIMs, eSIM issues, PIN/PUK problems, and other SIM-related issues. How can I help you today?",
      showEscalationButtons: false,
      category: null,
    };
  }

  isUnrelatedBroadbandQuery(input) {
    const patterns = ['wifi', 'wi-fi', 'router', 'broadband', 'fiber', 'internet speed', 'home internet', 'installation delay', 'modem'];
    return patterns.some(p => input.includes(p));
  }

  handleGreetings(input) {
    if (/^(hi|hello|hey|greetings)\b/i.test(input) && input.length < 15) {
      return "Hi! 👋 I'm your TeleCare AI Assistant.\n\nI can help with SIM activation, replacement, lost or damaged SIMs, eSIM issues, PIN/PUK problems, and other SIM-related issues.\n\nHow can I help you today?";
    }
    if (input.includes("how are you") || input.includes("how r u")) {
      return "I'm doing well, thanks! 😊 I'm ready to help with your SIM card issues. What SIM problem are you experiencing?";
    }
    if (/^(thanks|thank you|thx)\b/i.test(input)) {
      return "You're welcome! 😊 If you need help with your SIM card later, just come back and ask.";
    }
    if (/^(bye|goodbye)\b/i.test(input)) {
      return "Goodbye! 👋 If you need help with your SIM service later, just come back!";
    }
    return null;
  }

  isHumanSupportRequest(input) {
    return ['talk to a human', 'human agent', 'talk to human', 'speak to engineer', 'connect me to support', 'human support', 'talk to support'].some(p => input.includes(p));
  }

  isFailureConfirmation(input) {
    return ['still not working', 'still says no sim', 'didn\'t work', 'didnt work', 'same problem', 'no luck'].some(p => input.includes(p));
  }

  detectSIMIntent(input) {
    if (/(lost sim|i lost my sim|sim stolen|stole my sim)/.test(input)) return 'sim_lost';
    if (/(damaged|physically damaged|broken sim|cracked sim)/.test(input)) return 'sim_damaged';
    if (/(not working|no sim|sim stopped|not detected|no service|sim issue|sim problem)/.test(input)) return 'sim_not_working';
    if (/(activate sim|sim activation|new sim|hasn't activated|activation problem)/.test(input)) return 'sim_activation';
    if (/(esim|e-sim|esim profile|esim not working|esim activation)/.test(input)) return 'esim';
    if (/(pin|puk|forgot pin|sim pin|puk code|blocked sim)/.test(input)) return 'sim_pin_puk';
    if (/(replacement|replace sim|new sim card|get a new sim)/.test(input)) return 'sim_replacement';
    if (/(port|portability|mnp|switch network)/.test(input)) return 'sim_portability';
    if (/(deactivate|close sim|deactivation)/.test(input)) return 'sim_deactivation';
    if (/(transfer|ownership transfer)/.test(input)) return 'sim_ownership_transfer';
    if (/(sim billing|sim charge|recharge)/.test(input)) return 'sim_billing';
    return null;
  }

  startSIMFlow(intent, input) {
    switch (intent) {
      case 'sim_lost':
        return {
          text: "I'm sorry to hear that. For security, a lost SIM card should be blocked as soon as possible to prevent unauthorized use.",
          showEscalationButtons: true,
          category: 'SIM Lost',
          customButtons: [
            { label: 'Block Lost SIM', category: 'SIM Blocked' },
            { label: 'Request Replacement', category: 'SIM Replacement' },
            { label: 'Contact Support Engineer', category: 'SIM Lost' }
          ]
        };

      case 'sim_damaged':
        return {
          text: "I can help with that. Is the SIM card physically damaged (cracked/scratched), or is the phone simply not detecting it?",
          showEscalationButtons: false,
          category: 'SIM Damaged'
        };

      case 'sim_not_working':
        return {
          text: "I can help with that. Is your phone detecting the SIM card, or does it show **No SIM** or **No Service**?",
          showEscalationButtons: false,
          category: 'SIM Not Working'
        };

      case 'sim_activation':
        return {
          text: "I can help troubleshoot the activation issue. When did you receive your new SIM card?",
          showEscalationButtons: false,
          category: 'SIM Activation'
        };

      case 'esim':
        return {
          text: "I can help with your eSIM connection. Is the eSIM profile already installed on your device?",
          showEscalationButtons: false,
          category: 'eSIM Activation'
        };

      case 'sim_pin_puk':
        return {
          text: "If your SIM is asking for a PIN or PUK code, **do not repeatedly guess the code** as 3-10 incorrect attempts will permanently block your SIM card. Would you like help with PUK verification from a support engineer?",
          showEscalationButtons: true,
          category: 'SIM PIN / PUK Issue',
          customButtons: [
            { label: 'Contact Support Engineer', category: 'SIM PIN / PUK Issue' }
          ]
        };

      case 'sim_replacement':
        return {
          text: "To request a SIM replacement (for lost, damaged, or upgraded SIM cards), you can raise a SIM replacement request.",
          showEscalationButtons: true,
          category: 'SIM Replacement',
          customButtons: [
            { label: 'Request SIM Replacement', category: 'SIM Replacement' }
          ]
        };

      case 'sim_portability':
        return {
          text: "To port your mobile number to TeleCare AI (MNP):\n\n1. Send an SMS: **PORT <MobileNumber>** to **1900** from your current SIM.\n2. You will receive a 8-digit **UPC (Unique Porting Code)** via SMS.\n3. Create a SIM Portability support ticket with your UPC code to initiate activation.",
          showEscalationButtons: true,
          category: 'SIM Portability'
        };

      default:
        return {
          text: "How can I assist you with your SIM card today?",
          showEscalationButtons: false,
          category: 'Other SIM Issue'
        };
    }
  }

  handleContextualFollowup(input) {
    const intent = this.context.intent;

    if (intent === 'sim_not_working') {
      if (input.includes('no sim') || input.includes('not detecting') || input.includes('no service')) {
        return {
          text: "Got it. Please turn off your phone, remove the SIM card, check that it isn't visibly damaged, and reinsert it securely. Let me know when you've done that.",
          showEscalationButtons: false,
          category: 'SIM Not Working'
        };
      }
    }

    if (intent === 'sim_damaged') {
      if (input.includes('physically') || input.includes('damaged') || input.includes('cracked') || input.includes('yes')) {
        return {
          text: "Understood. A physical SIM replacement is required.",
          showEscalationButtons: true,
          category: 'SIM Replacement',
          customButtons: [
            { label: 'Request Replacement', category: 'SIM Replacement' }
          ]
        };
      }
    }

    if (intent === 'sim_activation') {
      if (input.includes('today') || input.includes('yesterday') || input.includes('days')) {
        return {
          text: "Thanks. Has the SIM been inserted into your phone and restarted at least once?",
          showEscalationButtons: false,
          category: 'SIM Activation'
        };
      }
      if (input.includes('yes') || input.includes('done') || input.includes('restarted')) {
        return {
          text: "If the SIM is still inactive after restarting, this requires account-level activation support from an engineer.",
          showEscalationButtons: true,
          category: 'SIM Activation',
          customButtons: [
            { label: 'Contact Support Engineer', category: 'SIM Activation' }
          ]
        };
      }
    }

    if (intent === 'esim') {
      if (input.includes('yes')) {
        return {
          text: "Is the eSIM showing as active in your mobile network settings, or is it displaying 'No Service'?",
          showEscalationButtons: false,
          category: 'eSIM Not Working'
        };
      }
    }

    return null;
  }

  getCategoryForIntent(intent) {
    const map = {
      sim_lost: 'SIM Lost',
      sim_damaged: 'SIM Damaged',
      sim_not_working: 'SIM Not Working',
      sim_activation: 'SIM Activation',
      esim: 'eSIM Activation',
      sim_pin_puk: 'SIM PIN / PUK Issue',
      sim_replacement: 'SIM Replacement',
      sim_portability: 'SIM Portability',
    };
    return map[intent] || 'Other SIM Issue';
  }
}

export const aiTelecomEngine = new AITelecomEngine();
export default aiTelecomEngine;
